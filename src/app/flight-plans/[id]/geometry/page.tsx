import Link from "next/link";

import "maplibre-gl/dist/maplibre-gl.css";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { canEditEntity } from "@/lib/authorize";
import { requirePageAuth } from "@/lib/require-page-auth";
import { GeometryEditorWrapper } from "@/modules/flight-plans/geometry-editor-wrapper";
import { updateFlightPlanGeometry } from "@/server/flight-plans/actions";
import { getFlightPlanById } from "@/server/flight-plans/queries";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  READY_FOR_SUBMISSION: "info",
  SUBMITTED: "info",
  AUTHORIZED: "success",
  OBSERVED: "warning",
  REJECTED: "danger",
  EXPIRED: "danger",
  CLOSED: "neutral",
  CANCELLED: "neutral",
};

function toneFromPermissionStatus(status: string) {
  return STATUS_TONES[status] ?? "neutral";
}

export default async function FlightPlanGeometryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requirePageAuth(`/flight-plans/${id}/geometry`);
  const canEdit = session?.user?.role ? canEditEntity(String(session.user.role)) : false;

  try {
    const record = await getFlightPlanById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Plan de vuelo no encontrado" description="El espacio de geometría necesita un registro operativo válido antes de cargar el GeoJSON canónico.">
            <p className="text-sm text-slate-600 dark:text-slate-400">Volvé al listado y elegí un plan de vuelo existente.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Workspace — Mapa operacional"
            title={`${record.code} · área de operación`}
            description="Workspace visual para dibujar la geometría de vuelo, medir áreas, controlar capas y preparar el permiso DGAC desde una sola vista."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/flight-plans/${record.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                  Volver al plan
                </Link>
                <StatusChip label={canEdit ? "Edición habilitada" : "Solo lectura"} tone={canEdit ? "success" : "neutral"} />
                <StatusChip label={record.permissionStatus} tone={toneFromPermissionStatus(record.permissionStatus)} />
              </div>
            }
          />

          {canEdit ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-300">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-white">Mapa primero:</span> dibujá, medí y ajustá el área sin salir del editor.
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900 dark:text-white">Acciones:</span> importar referencias, exportar entregables y guardar el GeoJSON canónico.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800/80 dark:bg-slate-950/70">Dibujar</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800/80 dark:bg-slate-950/70">Medir</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800/80 dark:bg-slate-950/70">Importar</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800/80 dark:bg-slate-950/70">Exportar</span>
                </div>
              </div>

              <GeometryEditorWrapper
                title="Workspace visual"
                description="Dibujá, medí, importá y exportá geometría desde el mapa. El GeoJSON interno se mantiene como formato avanzado."
                action={updateFlightPlanGeometry.bind(null, record.id)}
                flightPlanId={record.id}
                initialPayload={record.geometryJson ? JSON.stringify(record.geometryJson, null, 2) : ""}
              />
            </div>
          ) : (
            <DetailPanel title="Modo revisión" description="Este perfil puede ver la geometría, pero no editarla.">
              <div className="space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <p>
                  La geometría está protegida para perfiles de lectura y revisión. Si necesitás cambios, pedí que un perfil operativo abra el editor.
                </p>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Estado actual</p>
                  <p className="mt-2 font-medium text-slate-900 dark:text-white">
                    {record.geometryType ?? "Sin geometría adjunta todavía"}
                  </p>
                </div>
              </div>
            </DetailPanel>
          )}
        </div>
      </PageShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";

    return (
      <PageShell>
        <DetailPanel title="Espacio de geometría no disponible" description="La página apunta a Prisma real, pero la base no está lista o no responde.">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>
        </DetailPanel>
      </PageShell>
    );
  }
}

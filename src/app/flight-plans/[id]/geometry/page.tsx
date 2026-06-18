import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
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
  await requirePageAuth(`/flight-plans/${id}/geometry`);

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
            eyebrow="Bloque 3 / Editor satelital"
            title={`${record.code} · mapa de operación`}
            description="Dibujá el área de vuelo directamente sobre el mapa, controlá capas visibles y guardá la geometría operacional del plan."
            actions={<StatusChip label={record.permissionStatus} tone={toneFromPermissionStatus(record.permissionStatus)} />}
          />

          <GeometryEditorWrapper
            title="Control de operación"
            description="La geometría se guarda como dato interno, pero el trabajo principal se realiza desde el mapa."
            action={updateFlightPlanGeometry.bind(null, record.id)}
            flightPlanId={record.id}
            initialPayload={record.geometryJson ? JSON.stringify(record.geometryJson, null, 2) : ""}
          />
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

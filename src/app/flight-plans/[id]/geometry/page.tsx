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
          <DetailPanel title="Flight plan not found" description="The geometry workspace needs a valid operational record before it can load canonical GeoJSON.">
            <p className="text-sm text-slate-400">Return to the list and select an existing flight plan.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Bloque 3 / Geometría asistida por mapa"
            title={`${record.code} · área de operación`}
            description="Mostrá el GeoJSON actual en un mapa real, editá la geometría de forma controlada y guardala en el plan de vuelo."
            actions={<StatusChip label={record.permissionStatus} tone={toneFromPermissionStatus(record.permissionStatus)} />}
          />

          <GeometryEditorWrapper
            title="Editor de área de operación"
            description="Usá esta página para sincronizar GeoJSON canónico con un mapa vivo. Las herramientas geoespaciales pesadas quedan para una etapa posterior."
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
          <p className="text-sm text-slate-300">{message}</p>
          </DetailPanel>
        </PageShell>
      );
  }
}

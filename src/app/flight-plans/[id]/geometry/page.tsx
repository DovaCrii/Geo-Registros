import { FlightPlanStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { GeometryEditor } from "@/modules/flight-plans/geometry-editor";
import { updateFlightPlanGeometry } from "@/server/flight-plans/actions";
import { getFlightPlanById } from "@/server/flight-plans/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: FlightPlanStatus) {
  switch (status) {
    case FlightPlanStatus.READY_FOR_GEOMETRY:
      return "info";
    case FlightPlanStatus.ON_HOLD:
      return "warning";
    default:
      return "neutral";
  }
}

export default async function FlightPlanGeometryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
            eyebrow="Block 3 / Map-assisted geometry"
            title={`${record.code} · geometry`}
            description="Render the current GeoJSON on a real 2D map, edit it in a controlled way, and save it back to this flight plan."
            actions={<StatusChip label={record.status} tone={toneFromStatus(record.status)} />}
          />

          <GeometryEditor
            title="Geometry payload editor"
            description="Use this page to round-trip canonical GeoJSON with a live map preview. Heavy geospatial tooling remains deferred on purpose."
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
        <DetailPanel title="Geometry workspace unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

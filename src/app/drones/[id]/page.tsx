import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { DroneForm } from "@/modules/drones/drone-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { updateDrone } from "@/server/drones/actions";
import { getDroneById } from "@/server/drones/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function DroneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/drones/${id}`);

  try {
    const [record, costCenterOptions] = await Promise.all([
      getDroneById(id),
      listActiveCostCenters().catch(() => []),
    ]);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Drone not found" description="The requested drone does not exist or is no longer available.">
            <p className="text-sm text-slate-400">Go back to the list and select a valid aircraft record.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 2 / Drones"
            title={record.model}
            description="Edit the real aircraft inventory record while keeping operator assignment out of this MVP slice."
            actions={<StatusChip label={record.status} tone={toneFromStatus(record.status)} />}
          />

          <DroneForm
            title="Edit drone"
            description="Update inventory identity, manufacturer, optional cost center assignment, status, and notes."
            action={updateDrone.bind(null, record.id)}
            submitLabel="Save changes"
            costCenterOptions={costCenterOptions}
            initialValues={{
              code: record.code ?? "",
              serialNumber: record.serialNumber,
              manufacturer: record.manufacturer ?? "",
              model: record.model,
              notes: record.notes ?? "",
              costCenterId: record.costCenterId ?? "",
              status: record.status,
            }}
          />
        </div>
      </PageShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";

    return (
      <PageShell>
        <DetailPanel title="Drone unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

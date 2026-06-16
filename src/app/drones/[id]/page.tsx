import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { DroneForm } from "@/modules/drones/drone-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { deleteDrone } from "@/server/drones/actions";
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
            costCenterOptions={
              record.costCenter
                ? costCenterOptions.some((item) => item.id === record.costCenter!.id)
                  ? costCenterOptions
                  : [{ id: record.costCenter.id, code: record.costCenter.code ?? "", name: record.costCenter.name }, ...costCenterOptions]
                : costCenterOptions
            }
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

          <DetailPanel title="Danger zone" description="Soft delete hides this drone from active views while preserving history.">
            <form action={deleteDrone.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                This removes the drone from lists, selectors, and dashboard counts. Existing flight plans keep their historical link.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Delete drone
              </button>
            </form>
          </DetailPanel>
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

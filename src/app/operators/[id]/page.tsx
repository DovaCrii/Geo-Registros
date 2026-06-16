import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { OperatorForm } from "@/modules/operators/operator-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { deleteOperator } from "@/server/operators/actions";
import { updateOperator } from "@/server/operators/actions";
import { getOperatorById } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function OperatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/operators/${id}`);

  try {
    const [record, costCenterOptions] = await Promise.all([getOperatorById(id), listActiveCostCenters().catch(() => [])]);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Operator not found" description="The requested operator does not exist or is no longer available.">
            <p className="text-sm text-slate-400">Go back to the list and select a valid personnel record.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader eyebrow="Block 2 / Operators" title={record.fullName} description="Edit the real operator record while keeping advanced certifications and scheduling out of this slice." actions={<StatusChip label={record.status} tone={toneFromStatus(record.status)} />} />

            <OperatorForm
              title="Edit operator"
              description="Update operator identity, contact data, license number, optional cost center assignment, status, and notes."
              action={updateOperator.bind(null, record.id)}
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
                fullName: record.fullName,
                email: record.email ?? "",
                phone: record.phone ?? "",
                licenseNumber: record.licenseNumber ?? "",
                licenseExpiry: record.licenseExpiry ? record.licenseExpiry.toISOString().slice(0, 10) : "",
                notes: record.notes ?? "",
                costCenterId: record.costCenterId ?? "",
                status: record.status,
              }}
            />

          <DetailPanel title="Danger zone" description="Soft delete hides this operator from active views while preserving history.">
            <form action={deleteOperator.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                This removes the operator from lists, selectors, and dashboard counts. Existing flight plans keep their historical link.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Delete operator
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
        <DetailPanel title="Operator unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

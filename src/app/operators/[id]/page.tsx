import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { OperatorForm } from "@/modules/operators/operator-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { updateOperator } from "@/server/operators/actions";
import { getOperatorById } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function OperatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
            costCenterOptions={costCenterOptions}
            initialValues={{
              code: record.code ?? "",
              fullName: record.fullName,
              email: record.email ?? "",
              phone: record.phone ?? "",
              licenseNumber: record.licenseNumber ?? "",
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
        <DetailPanel title="Operator unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

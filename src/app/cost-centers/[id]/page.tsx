import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { CostCenterForm } from "@/modules/cost-centers/cost-center-form";
import { updateCostCenter } from "@/server/cost-centers/actions";
import { getCostCenterById } from "@/server/cost-centers/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function CostCenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/cost-centers/${id}`);

  try {
    const record = await getCostCenterById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Cost center not found" description="The requested cost center does not exist or is no longer available.">
            <p className="text-sm text-slate-400">Go back to the list and select a valid operational record.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 2 / Cost centers"
            title={record.name}
            description="Edit the core operational anchor without mixing in later modules yet."
            actions={<StatusChip label={record.status} tone={toneFromStatus(record.status)} />}
          />

          <CostCenterForm
            title="Edit cost center"
            description="Update code, name, status, or internal description. Changes persist through Prisma."
            action={updateCostCenter.bind(null, record.id)}
            submitLabel="Save changes"
            initialValues={{
              code: record.code,
              name: record.name,
              description: record.description ?? "",
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
        <DetailPanel title="Cost center unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

import { RecordStatus } from "@prisma/client";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { CostCenterForm } from "@/modules/cost-centers/cost-center-form";
import { createCostCenter } from "@/server/cost-centers/actions";

export default async function NewCostCenterPage() {
  await requirePageAuth("/cost-centers/new");

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Block 2 / Cost centers"
          title="Create cost center"
          description="Register the first real operational anchor for plans, drones, operators, and future permit flows."
        />

        <CostCenterForm
          title="Cost center form"
          description="Use a stable code and a clear operational name. Keep this slice simple and auditable."
          action={createCostCenter}
          submitLabel="Create cost center"
          initialValues={{
            code: "",
            name: "",
            description: "",
            status: RecordStatus.ACTIVE,
          }}
        />
      </div>
    </PageShell>
  );
}

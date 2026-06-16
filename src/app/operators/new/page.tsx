import { RecordStatus } from "@prisma/client";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { OperatorForm } from "@/modules/operators/operator-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { createOperator } from "@/server/operators/actions";

export const dynamic = "force-dynamic";

export default async function NewOperatorPage() {
  await requirePageAuth("/operators/new");

  const costCenterOptions = await listActiveCostCenters().catch(() => []);

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader eyebrow="Block 2 / Operators" title="Register operator" description="Create the first real personnel slice with identity, license, and optional cost center assignment." />

        <OperatorForm
          title="Operator form"
          description="Keep this slice stable: identity, contact data, license number, optional cost center, and status."
          action={createOperator}
          submitLabel="Create operator"
          costCenterOptions={costCenterOptions}
          initialValues={{ code: "", fullName: "", email: "", phone: "", licenseNumber: "", licenseExpiry: "", notes: "", costCenterId: "", status: RecordStatus.ACTIVE }}
        />
      </div>
    </PageShell>
  );
}

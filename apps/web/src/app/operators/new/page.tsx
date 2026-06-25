import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Operadores RPAS", href: "/operators" },
            { label: "Registrar operador" },
          ]}
        />

        <PageHeader
          eyebrow="Bloque 2 / Datos maestros"
          title="Registrar operador"
          description="Agregá un nuevo operador RPA con datos personales, licencia y grupo de trabajo."
        />

        <OperatorForm
          title="Nuevo operador"
          description="Completá identidad, contacto, número de licencia y grupo de trabajo opcional."
          action={createOperator}
          submitLabel="Registrar operador"
          costCenterOptions={costCenterOptions}
          initialValues={{
            code: "",
            fullName: "",
            email: "",
            phone: "",
            licenseNumber: "",
            licenseExpiry: "",
            notes: "",
            costCenterId: "",
            status: RecordStatus.ACTIVE,
          }}
        />
      </div>
    </PageShell>
  );
}

import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Grupos de trabajo", href: "/cost-centers" }, { label: "Crear grupo de trabajo" }]} />

        <PageHeader
          eyebrow="Bloque 2 / Datos maestros"
          title="Crear grupo de trabajo"
          description="Registrá un nuevo grupo, área o centro que agrupe drones, operadores y planes de vuelo."
        />

        <CostCenterForm
          title="Nuevo grupo de trabajo"
          description="Usá un código estable y un nombre operativo claro."
          action={createCostCenter}
          submitLabel="Crear grupo de trabajo"
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

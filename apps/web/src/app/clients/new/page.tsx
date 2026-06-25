import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { ClientForm } from "@/modules/clients/client-form";
import { createClient } from "@/server/clients/actions";

export default async function NewClientPage() {
  await requirePageAuth("/clients/new");

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Clientes", href: "/clients" }, { label: "Crear cliente" }]} />

        <PageHeader
          eyebrow="Bloque 2 / Datos maestros"
          title="Crear cliente"
          description="Registrá un nuevo cliente o mandante antes de vincularlo a planes de vuelo y documentos."
        />

        <ClientForm
          title="Nuevo cliente"
          description="Completá los datos de identidad, contacto principal y estado."
          action={createClient}
          submitLabel="Crear cliente"
          initialValues={{
            code: "",
            name: "",
            contactName: "",
            contactEmail: "",
            notes: "",
            status: RecordStatus.ACTIVE,
          }}
        />
      </div>
    </PageShell>
  );
}

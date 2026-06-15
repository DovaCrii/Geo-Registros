import { RecordStatus } from "@prisma/client";

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
        <PageHeader
          eyebrow="Block 2 / Clients"
          title="Create client"
          description="Register a real mandante/institutional counterpart before connecting flight plans and documents."
        />

        <ClientForm
          title="Client form"
          description="Keep the first slice clean: core identity, primary contact, status, and lightweight notes."
          action={createClient}
          submitLabel="Create client"
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

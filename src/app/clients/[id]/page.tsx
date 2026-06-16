import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { ClientForm } from "@/modules/clients/client-form";
import { deleteClient } from "@/server/clients/actions";
import { updateClient } from "@/server/clients/actions";
import { getClientById } from "@/server/clients/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/clients/${id}`);

  try {
    const record = await getClientById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Client not found" description="The requested client does not exist or is no longer available.">
            <p className="text-sm text-slate-400">Go back to the list and select a valid client record.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 2 / Clients"
            title={record.name}
            description="Edit the real client record without pulling in downstream contract or document rules yet."
            actions={<StatusChip label={record.status} tone={toneFromStatus(record.status)} />}
          />

          <ClientForm
            title="Edit client"
            description="Update the client identity, primary contact data, status, and internal notes."
            action={updateClient.bind(null, record.id)}
            submitLabel="Save changes"
            initialValues={{
              code: record.code ?? "",
              name: record.name,
              contactName: record.contactName ?? "",
              contactEmail: record.contactEmail ?? "",
              notes: record.notes ?? "",
              status: record.status,
            }}
          />

          <DetailPanel title="Danger zone" description="Soft delete hides this client from active views while preserving historical flight-plan records.">
            <form action={deleteClient.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                This removes the client from list pages, selectors, and dashboard counts. Flight plans already linked to the client remain intact.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Delete client
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
        <DetailPanel title="Client unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

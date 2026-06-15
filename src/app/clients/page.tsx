import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { listClients } from "@/server/clients/queries";

export const dynamic = "force-dynamic";

type ClientRow = Awaited<ReturnType<typeof listClients>>[number];

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

const columns: Array<DataColumn<ClientRow>> = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "name",
    header: "Client",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.name}</p>
        <p className="text-xs text-slate-500">{row.notes ?? "No internal notes yet."}</p>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Primary contact",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row.contactName ?? "Not defined"}</p>
        <p className="text-xs text-slate-500">{row.contactEmail ?? "No email"}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusChip label={row.status} tone={toneFromStatus(row.status)} />,
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <Link href={`/clients/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export default async function ClientsPage() {
  try {
    const rows = await listClients();

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 2 / Master data"
            title="Clients"
            description="Second real CRUD slice. This page is now wired to Prisma instead of static placeholder data."
            actions={
              <Link
                href="/clients/new"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
              >
                Create client
              </Link>
            }
          />

          <FilterBar>
            <FilterField label="Search" placeholder="Search client code or name" />
            <FilterField label="Contract type" placeholder="Reserved for next slice" />
            <FilterField label="Account owner" placeholder="Reserved for next slice" />
            <FilterField label="Status" placeholder="ACTIVE / INACTIVE" />
          </FilterBar>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            <DataTable
              title="Clients workspace"
              description={
                rows.length > 0
                  ? "Client records persist through Prisma. Keep this slice narrow before jumping to Drone or Operator."
                  : "No clients yet. Create the first real client record before wiring downstream flows."
              }
              columns={columns}
              rows={rows}
            />

            <DetailPanel
              title="Current slice boundary"
              description="This slice covers real list/create/edit/status flow for clients only."
            >
              <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Persistence</span>
                  <StatusChip label="Real Prisma path" tone="success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Create / edit</span>
                  <StatusChip label="Enabled" tone="info" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Delete</span>
                  <StatusChip label="Deferred" tone="warning" />
                </div>
              </div>

              <Link
                href="/clients/new"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Open create form
              </Link>
            </DetailPanel>
          </div>
        </div>
      </PageShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";

    return (
      <PageShell>
        <DetailPanel title="Clients unavailable" description="The UI is connected to the real Prisma query path, but the database is not reachable yet.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

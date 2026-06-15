import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { listDrones } from "@/server/drones/queries";

export const dynamic = "force-dynamic";

type DroneRow = Awaited<ReturnType<typeof listDrones>>[number];

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

const columns: Array<DataColumn<DroneRow>> = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "aircraft",
    header: "Aircraft",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.model}</p>
        <p className="text-xs text-slate-500">{row.manufacturer ?? "Manufacturer pending"}</p>
      </div>
    ),
  },
  {
    key: "serial",
    header: "Serial / Cost center",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row.serialNumber}</p>
        <p className="text-xs text-slate-500">
          {row.costCenter ? `${row.costCenter.code} — ${row.costCenter.name}` : "Unassigned"}
        </p>
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
      <Link href={`/drones/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export default async function DronesPage() {
  try {
    const rows = await listDrones();

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 2 / Master data"
            title="Drones"
            description="Third real CRUD slice. Aircraft inventory is now wired to Prisma with optional cost center assignment only."
            actions={
              <Link
                href="/drones/new"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
              >
                Register drone
              </Link>
            }
          />

          <FilterBar>
            <FilterField label="Search" placeholder="Search code, serial, or model" />
            <FilterField label="Platform class" placeholder="Reserved for next slice" />
            <FilterField label="Cost center" placeholder="Reserved for next slice" />
            <FilterField label="Status" placeholder="ACTIVE / INACTIVE" />
          </FilterBar>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            <DataTable
              title="Drones workspace"
              description={
                rows.length > 0
                  ? "Drone records persist through Prisma. Operator assignment intentionally stays out of this slice."
                  : "No drones yet. Register the first real aircraft inventory record before moving to Operator."
              }
              columns={columns}
              rows={rows}
            />

            <DetailPanel
              title="Current slice boundary"
              description="This slice covers real list/create/edit/status flow for drones with optional cost center assignment."
            >
              <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Persistence</span>
                  <StatusChip label="Real Prisma path" tone="success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Cost center link</span>
                  <StatusChip label="Optional" tone="info" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Operator binding</span>
                  <StatusChip label="Deferred" tone="warning" />
                </div>
              </div>

              <Link
                href="/drones/new"
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
        <DetailPanel title="Drones unavailable" description="The UI is connected to the real Prisma query path, but the database is not reachable yet.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

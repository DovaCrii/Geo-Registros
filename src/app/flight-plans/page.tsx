import Link from "next/link";
import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { listFlightPlans } from "@/server/flight-plans/queries";

export const dynamic = "force-dynamic";

type FlightPlanRow = Awaited<ReturnType<typeof listFlightPlans>>[number];

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  READY_FOR_SUBMISSION: "info",
  SUBMITTED: "info",
  AUTHORIZED: "success",
  OBSERVED: "warning",
  REJECTED: "danger",
  EXPIRED: "danger",
  CLOSED: "neutral",
  CANCELLED: "neutral",
};

function toneFromPermissionStatus(status: string) {
  return STATUS_TONES[status] ?? "neutral";
}

const formatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const columns: Array<DataColumn<FlightPlanRow>> = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "plan",
    header: "Flight plan",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.title}</p>
        <p className="text-xs text-slate-500">{formatter.format(row.operationDate)}</p>
      </div>
    ),
  },
  {
    key: "assignment",
    header: "Assignment",
    render: (row) => (
      <div className="space-y-1 text-sm text-slate-300">
        <p>{row.costCenter.code} · {row.client.name}</p>
        <p className="text-xs text-slate-500">{row.drone.model} / {row.operator.fullName}</p>
      </div>
    ),
  },
  {
    key: "geometry",
    header: "Geometry",
    render: (row) =>
      row.geometryType ? (
        <div className="space-y-1">
          <StatusChip label="Attached" tone="info" />
          <p className="text-xs text-slate-500">{row.geometryType}</p>
        </div>
      ) : (
        <StatusChip label="Missing" tone="neutral" />
      ),
  },
  {
    key: "permissionStatus",
    header: "Permission",
    render: (row) => <StatusChip label={row.permissionStatus} tone={toneFromPermissionStatus(row.permissionStatus)} />,
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <div className="flex flex-col gap-1 text-sm font-medium">
        <Link href={`/flight-plans/${row.id}`} className="text-cyan-300 transition hover:text-cyan-200">
          Edit
        </Link>
        <Link href={`/flight-plans/${row.id}/geometry`} className="text-slate-300 transition hover:text-slate-100">
          Geometry
        </Link>
      </div>
    ),
  },
];

export default async function FlightPlansPage() {
  try {
    const rows = await listFlightPlans();

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 3 / Operational foundation"
            title="Flight plans"
            description="First operational record flow before geometry, map tooling, permit orchestration, and document packages."
            actions={
              <Link
                href="/flight-plans/new"
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
              >
                Create flight plan
              </Link>
            }
          />

          <FilterBar>
            <FilterField label="Search" placeholder="Search code or title" />
            <FilterField label="Operation date" placeholder="Reserved for next slice" />
            <FilterField label="Cost center" placeholder="Reserved for next slice" />
            <FilterField label="Status" placeholder="DRAFT / READY / HOLD" />
          </FilterBar>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            <DataTable
              title="Flight plan workspace"
              description={
                rows.length > 0
                  ? "Operational records can now round-trip canonical GeoJSON through a dedicated map-assisted geometry page."
                  : "No flight plans yet. Create the first record before introducing geometry and permit flow."
              }
              columns={columns}
              rows={rows}
            />

            <DetailPanel
              title="Slice boundary"
              description="Operational records and the geometry boundary are active. The dedicated geometry page is now the bounded editing surface."
            >
              <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Master data links</span>
                  <StatusChip label="Required" tone="success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Geometry</span>
                  <StatusChip label="Map-assisted" tone="info" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Permits / documents</span>
                  <StatusChip label="Deferred" tone="warning" />
                </div>
              </div>

              <Link
                href="/flight-plans/new"
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
        <DetailPanel title="Flight plans unavailable" description="The UI is connected to the real Prisma query path, but the database is not reachable yet.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

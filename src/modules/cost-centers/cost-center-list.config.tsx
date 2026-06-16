import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import { ListColumn, ListConfig } from "@/lib/list-config/types";

type CostCenterRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: RecordStatus;
  _count: { drones: number; operators: number };
};

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export const costCenterColumns: ListColumn<CostCenterRow>[] = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "name",
    header: "Cost center",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.name}</p>
        {row.description && <p className="text-xs text-slate-500">{row.description}</p>}
      </div>
    ),
  },
  {
    key: "linkedRecords",
    header: "Linked records",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row._count.drones} drones</p>
        <p className="text-xs text-slate-500">{row._count.operators} operators</p>
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
      <Link href={`/cost-centers/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export const costCenterListConfig: ListConfig<CostCenterRow> = {
  eyebrow: "Block 2 / Master data",
  title: "Cost centers",
  description: "First real CRUD slice after FlightPlan. Cost centers anchor the entire operation.",
  columns: costCenterColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Código o nombre…" },
    { field: "status", label: "Status", type: "status" },
  ],
  actions: {
    create: { href: "/cost-centers/new", label: "Register cost center" },
  },
  sidebar: {
    title: "Current slice boundary",
    description: "Real list/create/edit/status and soft-delete flow for cost centers.",
    items: [
      { label: "Persistence", value: "Real Prisma path", tone: "success" },
      { label: "Soft delete", value: "Enabled", tone: "success" },
    ],
    action: { href: "/cost-centers/new", label: "Open create form" },
  },
  searchPlaceholder: "Código o nombre…",
  pageSize: 10,
};

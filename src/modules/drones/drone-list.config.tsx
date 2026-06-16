import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import { ListColumn, ListConfig } from "@/lib/list-config/types";

type DroneRow = {
  id: string;
  code: string | null;
  serialNumber: string;
  manufacturer: string | null;
  model: string;
  notes: string | null;
  status: RecordStatus;
  costCenter: { id: string; code: string; name: string } | null;
};

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export const droneColumns: ListColumn<DroneRow>[] = [
  {
    key: "code",
    header: "Code",
    sortable: true,
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
    key: "serialNumber",
    header: "Serial / Cost center",
    sortable: true,
    sortField: "serialNumber",
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
    sortable: true,
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

export const droneListConfig: ListConfig<DroneRow> = {
  eyebrow: "Block 2 / Master data",
  title: "Drones",
  description:
    "Third real CRUD slice. Aircraft inventory is now wired to Prisma with optional cost center assignment only.",
  columns: droneColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Código, serie, modelo…" },
    { field: "status", label: "Status", type: "status" },
  ],
  actions: {
    create: { href: "/drones/new", label: "Register drone" },
  },
  sidebar: {
    title: "Current slice boundary",
    description: "Real list/create/edit/status flow for drones with optional cost center assignment.",
    items: [
      { label: "Persistence", value: "Real Prisma path", tone: "success" },
      { label: "Cost center link", value: "Optional", tone: "info" },
      { label: "Operator binding", value: "Deferred", tone: "warning" },
    ],
    action: { href: "/drones/new", label: "Open create form" },
  },
  searchPlaceholder: "Código, serie, modelo…",
  pageSize: 10,
};

import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import { ListColumn, ListConfig } from "@/lib/list-config/types";

type OperatorRow = {
  id: string;
  code: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  notes: string | null;
  status: RecordStatus;
  costCenter: { id: string; code: string; name: string } | null;
};

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export const operatorColumns: ListColumn<OperatorRow>[] = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "operator",
    header: "Operator",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.fullName}</p>
        <p className="text-xs text-slate-500">{row.licenseNumber ?? "License pending"}</p>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contact / Cost center",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row.email ?? row.phone ?? "No contact"}</p>
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
      <Link href={`/operators/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export const operatorListConfig: ListConfig<OperatorRow> = {
  eyebrow: "Block 2 / Master data",
  title: "Operators",
  description: "Fourth real CRUD slice. Personnel records are now wired to Prisma with optional cost center assignment.",
  columns: operatorColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Nombre, código o licencia…" },
    { field: "status", label: "Status", type: "status" },
  ],
  actions: {
    create: { href: "/operators/new", label: "Register operator" },
  },
  sidebar: {
    title: "Current slice boundary",
    description: "Real list/create/edit/status and soft-delete flow for operators with optional cost center assignment.",
    items: [
      { label: "Persistence", value: "Real Prisma path", tone: "success" },
      { label: "License field", value: "Enabled", tone: "info" },
      { label: "Advanced cert.", value: "Deferred", tone: "warning" },
    ],
    action: { href: "/operators/new", label: "Open create form" },
  },
  searchPlaceholder: "Nombre, código o licencia…",
  pageSize: 10,
};

import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import { ListColumn, ListConfig } from "@/lib/list-config/types";

type ClientRow = {
  id: string;
  code: string | null;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  status: RecordStatus;
};

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export const clientColumns: ListColumn<ClientRow>[] = [
  {
    key: "code",
    header: "Code",
    sortable: true,
    render: (row) => <span className="font-medium text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "name",
    header: "Client",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.name}</p>
        {row.notes && <p className="text-xs text-slate-500">{row.notes}</p>}
      </div>
    ),
  },
  {
    key: "contact",
    header: "Primary contact",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row.contactName ?? "—"}</p>
        {row.contactEmail && <p className="text-xs text-slate-500">{row.contactEmail}</p>}
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
      <Link href={`/clients/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export const clientListConfig: ListConfig<ClientRow> = {
  eyebrow: "Block 2 / Master data",
  title: "Clients",
  description: "Second real CRUD slice. Client records are wired to Prisma with contact fields and soft-delete support.",
  columns: clientColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Código, nombre o contacto…" },
    { field: "status", label: "Status", type: "status" },
  ],
  actions: {
    create: { href: "/clients/new", label: "Register client" },
  },
  sidebar: {
    title: "Current slice boundary",
    description: "Real list/create/edit/status and soft-delete flow for clients.",
    items: [
      { label: "Persistence", value: "Real Prisma path", tone: "success" },
      { label: "Soft delete", value: "Enabled", tone: "success" },
      { label: "Operator binding", value: "Deferred", tone: "warning" },
    ],
    action: { href: "/clients/new", label: "Open create form" },
  },
  searchPlaceholder: "Código, nombre o contacto…",
  pageSize: 10,
};

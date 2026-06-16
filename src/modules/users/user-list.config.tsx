import Link from "next/link";
import { Role } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import type { ListColumn, ListConfig } from "@/lib/list-config/types";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  GERENTE_OPERACIONES_AEREAS: "Gerente Operaciones",
  JEFE_SEGURIDAD_AEREA: "Jefe Seguridad Aérea",
  ADC: "ADC",
  ESPECIALISTA_DOCUMENTAL: "Especialista Documental",
  OPERADOR_RPA: "Operador RPA",
  AUDITOR: "Auditor",
  VIEWER: "Viewer",
};

const ROLE_TONES: Record<string, "success" | "info" | "warning" | "neutral" | "danger"> = {
  ADMIN: "danger",
  GERENTE_OPERACIONES_AEREAS: "info",
  JEFE_SEGURIDAD_AEREA: "warning",
  ADC: "warning",
  ESPECIALISTA_DOCUMENTAL: "neutral",
  OPERADOR_RPA: "success",
  AUDITOR: "neutral",
  VIEWER: "neutral",
};

export const userColumns: ListColumn<UserRow>[] = [
  {
    key: "fullName",
    header: "Name",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.fullName}</p>
        <p className="text-xs text-slate-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    render: (row) => (
      <StatusChip label={ROLE_LABELS[row.role] ?? row.role} tone={ROLE_TONES[row.role] ?? "neutral"} />
    ),
  },
  {
    key: "active",
    header: "Status",
    sortable: true,
    render: (row) => (
      <StatusChip label={row.active ? "Active" : "Inactive"} tone={row.active ? "success" : "neutral"} />
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (row) => (
      <span className="text-sm text-slate-400">{row.createdAt.toISOString().slice(0, 10)}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <Link href={`/admin/users/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Edit
      </Link>
    ),
  },
];

export const userListConfig: ListConfig<UserRow> = {
  eyebrow: "Admin",
  title: "Users",
  description: "Manage user accounts, roles, and access.",
  columns: userColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Name or email…" },
    {
      field: "role",
      label: "Role",
      type: "select",
      placeholder: "All roles",
      options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
    },
    { field: "status", label: "Status", type: "status" },
  ],
  headerActions: [
    { href: "/admin/users/new", label: "Create user", variant: "primary" },
  ],
  batchActions: [
    { label: "Deactivate", handler: "deactivate", variant: "warning" },
    { label: "Reactivate", handler: "reactivate", variant: "primary" },
  ],
  sidebar: {
    title: "User management",
    description: "Create, edit, and manage system users and their roles.",
    items: [
      { label: "Total users", value: "—", tone: "info" },
    ],
    action: { href: "/admin/users/new", label: "Create user" },
  },
  searchPlaceholder: "Name or email…",
  pageSize: 10,
};

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
  VIEWER: "Visor",
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
    header: "Nombre",
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
    header: "Rol",
    sortable: true,
    render: (row) => (
      <StatusChip label={ROLE_LABELS[row.role] ?? row.role} tone={ROLE_TONES[row.role] ?? "neutral"} />
    ),
  },
  {
    key: "active",
    header: "Estado",
    sortable: true,
    render: (row) => (
      <StatusChip label={row.active ? "Activo" : "Inactivo"} tone={row.active ? "success" : "neutral"} />
    ),
  },
  {
    key: "createdAt",
    header: "Creado",
    sortable: true,
    render: (row) => (
      <span className="text-sm text-slate-400">{row.createdAt.toISOString().slice(0, 10)}</span>
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <Link href={`/admin/users/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Editar
      </Link>
    ),
  },
];

export const userListConfig: ListConfig<UserRow> = {
  eyebrow: "Admin",
  title: "Usuarios",
  description: "Gestioná cuentas de usuario, roles y acceso.",
  columns: userColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Nombre o correo…" },
    {
      field: "role",
      label: "Rol",
      type: "select",
      placeholder: "Todos los roles",
      options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
    },
    { field: "status", label: "Estado", type: "status" },
  ],
  headerActions: [
    { href: "/admin/users/new", label: "Crear usuario", variant: "primary" },
  ],
  batchActions: [
    { label: "Desactivar", handler: "deactivate", variant: "warning" },
    { label: "Reactivar", handler: "reactivate", variant: "primary" },
  ],
  sidebar: {
    title: "Gestión de usuarios",
    description: "Creá, editá y gestioná usuarios del sistema y sus roles.",
    items: [
      { label: "Total usuarios", value: "—", tone: "info" },
    ],
    action: { href: "/admin/users/new", label: "Crear usuario" },
  },
  searchPlaceholder: "Nombre o correo…",
  pageSize: 10,
};

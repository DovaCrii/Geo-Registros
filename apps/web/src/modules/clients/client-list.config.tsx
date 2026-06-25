import { RecordStatus } from "@prisma/client";
import Link from "next/link";

import { StatusChip } from "@/components/ui/status-chip";
import type { ListColumn, ListConfig } from "@/lib/list-config/types";

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
    header: "Código",
    sortable: true,
    render: (row) => (
      <span className="font-medium text-slate-900 dark:text-white">{row.code ?? "—"}</span>
    ),
  },
  {
    key: "name",
    header: "Cliente",
    sortable: true,
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-slate-900 dark:text-white">{row.name}</p>
        {row.notes && <p className="text-xs text-slate-600 dark:text-slate-500">{row.notes}</p>}
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contacto principal",
    render: (row) => (
      <div className="space-y-1 text-slate-700 dark:text-slate-300">
        <p>{row.contactName ?? "—"}</p>
        {row.contactEmail && (
          <p className="text-xs text-slate-600 dark:text-slate-500">{row.contactEmail}</p>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Estado",
    sortable: true,
    render: (row) => (
      <StatusChip
        label={row.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"}
        tone={toneFromStatus(row.status)}
      />
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <Link
        href={`/clients/${row.id}`}
        className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
      >
        Editar
      </Link>
    ),
  },
];

export const clientListConfig: ListConfig<ClientRow> = {
  eyebrow: "Bloque 2 / Datos maestros",
  title: "Clientes",
  description: "Registrá y gestioná los clientes asociados a cada plan de vuelo y operación.",
  columns: clientColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Código, nombre o contacto…" },
    { field: "status", label: "Estado", type: "status" },
  ],
  headerActions: [{ href: "/clients/new", label: "Registrar cliente", variant: "primary" }],
  sidebar: {
    title: "Resumen del cliente",
    description: "Datos de contacto y estado operativo del cliente.",
    items: [
      { label: "Persistencia", value: "Base de datos real", tone: "success" },
      { label: "Eliminación lógica", value: "Habilitada", tone: "success" },
      { label: "Vinculación operador", value: "Pendiente", tone: "warning" },
    ],
    action: { href: "/clients/new", label: "Crear cliente" },
  },
  searchPlaceholder: "Código, nombre o contacto…",
  pageSize: 10,
};

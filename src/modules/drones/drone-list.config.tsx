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
  insuranceExpiry: Date | null;
  costCenter: { id: string; code: string; name: string } | null;
};

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export const droneColumns: ListColumn<DroneRow>[] = [
  {
    key: "code",
    header: "Código",
    sortable: true,
    render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "aircraft",
    header: "Aeronave",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-slate-900 dark:text-white">{row.model}</p>
        <p className="text-xs text-slate-600 dark:text-slate-500">{row.manufacturer ?? "Fabricante pendiente"}</p>
      </div>
    ),
  },
  {
    key: "serialNumber",
    header: "Serie / Grupo",
    sortable: true,
    sortField: "serialNumber",
    render: (row) => (
      <div className="space-y-1 text-slate-700 dark:text-slate-300">
        <p>{row.serialNumber}</p>
        <p className="text-xs text-slate-600 dark:text-slate-500">
          {row.costCenter ? (
            <Link href={`/cost-centers/${row.costCenter.id}`} className="transition hover:text-cyan-600 dark:hover:text-cyan-300">
              {row.costCenter.code} — {row.costCenter.name}
            </Link>
          ) : (
            "Sin asignar"
          )}
        </p>
      </div>
    ),
  },
  {
    key: "insuranceExpiry",
    header: "Vencimiento seguro",
    render: (row) => {
      if (!row.insuranceExpiry) return <span className="text-sm text-slate-500">—</span>;
      const date = new Date(row.insuranceExpiry);
      const isExpired = date < new Date();
        return (
        <span className={`text-sm ${isExpired ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
          {date.toISOString().slice(0, 10)}
          {isExpired && <span className="ml-1.5 text-xs text-red-600 dark:text-red-400">(Vencido)</span>}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Estado",
    sortable: true,
    render: (row) => <StatusChip label={row.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(row.status)} />,
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <Link href={`/drones/${row.id}`} className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200">
        Editar
      </Link>
    ),
  },
];

export const droneListConfig: ListConfig<DroneRow> = {
  eyebrow: "Bloque 2 / Datos maestros",
  title: "Flota RPAS",
  description: "Inventario de aeronaves no tripuladas registradas, con estado, vencimiento de seguro y grupo de trabajo asociado.",
  columns: droneColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Código, serie, modelo…" },
    { field: "status", label: "Estado", type: "status" },
  ],
  headerActions: [
    { href: "/drones/new", label: "Registrar dron", variant: "primary" },
  ],
  batchActions: [
    { label: "Activar", handler: "activate" },
    { label: "Desactivar", handler: "deactivate", variant: "warning" },
    { label: "Eliminar", handler: "delete", variant: "danger" },
  ],
  reorderKey: "drones",
  sidebar: {
    title: "Resumen de flota",
    description: "Administración de drones con estado, vencimiento y grupo de trabajo opcional.",
    items: [
      { label: "Persistencia", value: "Base de datos real", tone: "success" },
      { label: "Grupo de trabajo", value: "Opcional", tone: "info" },
      { label: "Vinculación operador", value: "Pendiente", tone: "warning" },
    ],
    action: { href: "/drones/new", label: "Registrar dron" },
  },
  searchPlaceholder: "Código, serie, modelo…",
  pageSize: 10,
};

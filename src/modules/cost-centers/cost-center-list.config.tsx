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
    header: "Código",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "name",
    header: "Grupo de trabajo",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.name}</p>
        {row.description && <p className="text-xs text-slate-500">{row.description}</p>}
      </div>
    ),
  },
  {
    key: "linkedRecords",
    header: "Registros vinculados",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row._count.drones} drones</p>
        <p className="text-xs text-slate-500">{row._count.operators} operadores</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (row) => <StatusChip label={row.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(row.status)} />,
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <Link href={`/cost-centers/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Editar
      </Link>
    ),
  },
];

export const costCenterListConfig: ListConfig<CostCenterRow> = {
  eyebrow: "Bloque 2 / Datos maestros",
  title: "Grupos de trabajo",
  description: "Administrá los equipos, áreas o centros que agrupan drones, operadores y planes de vuelo.",
  columns: costCenterColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Código o nombre…" },
    { field: "status", label: "Estado", type: "status" },
  ],
  headerActions: [
    { href: "/cost-centers/new", label: "Crear grupo de trabajo", variant: "primary" },
  ],
  sidebar: {
    title: "Resumen del grupo",
    description: "Cada grupo organiza drones, operadores y planes de vuelo asociados.",
    items: [
      { label: "Persistencia", value: "Base de datos real", tone: "success" },
      { label: "Eliminación lógica", value: "Habilitada", tone: "success" },
    ],
    action: { href: "/cost-centers/new", label: "Crear grupo" },
  },
  searchPlaceholder: "Código o nombre…",
  pageSize: 10,
};

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
  licenseExpiry: Date | null;
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
    header: "Código",
    render: (row) => <span className="font-medium text-white">{row.code ?? "—"}</span>,
  },
  {
    key: "operator",
    header: "Operador",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.fullName}</p>
        <p className="text-xs text-slate-500">{row.licenseNumber ?? "Licencia pendiente"}</p>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contacto / Grupo",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p>{row.email ?? row.phone ?? "Sin contacto"}</p>
        <p className="text-xs text-slate-500">
          {row.costCenter ? (
            <Link href={`/cost-centers/${row.costCenter.id}`} className="transition hover:text-cyan-300">
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
    key: "licenseExpiry",
    header: "Vencimiento licencia",
    render: (row) => {
      if (!row.licenseExpiry) return <span className="text-sm text-slate-500">—</span>;
      const date = new Date(row.licenseExpiry);
      const isExpired = date < new Date();
      return (
        <span className={`text-sm ${isExpired ? "text-red-400" : "text-slate-300"}`}>
          {date.toISOString().slice(0, 10)}
          {isExpired && <span className="ml-1.5 text-xs text-red-400">(Vencida)</span>}
        </span>
      );
    },
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
      <Link href={`/operators/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
        Editar
      </Link>
    ),
  },
];

export const operatorListConfig: ListConfig<OperatorRow> = {
  eyebrow: "Bloque 2 / Datos maestros",
  title: "Operadores RPAS",
  description: "Registro de personal operativo con licencia, contacto y grupo de trabajo asociado.",
  columns: operatorColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Nombre, código o licencia…" },
    { field: "status", label: "Estado", type: "status" },
  ],
  headerActions: [
    { href: "/operators/new", label: "Registrar operador", variant: "primary" },
  ],
  sidebar: {
    title: "Resumen del operador",
    description: "Datos personales, licencia y grupo de trabajo del operador RPA.",
    items: [
      { label: "Persistencia", value: "Base de datos real", tone: "success" },
      { label: "Licencia", value: "Habilitada", tone: "info" },
      { label: "Cert. avanzada", value: "Pendiente", tone: "warning" },
    ],
    action: { href: "/operators/new", label: "Crear operador" },
  },
  searchPlaceholder: "Nombre, código o licencia…",
  pageSize: 10,
};

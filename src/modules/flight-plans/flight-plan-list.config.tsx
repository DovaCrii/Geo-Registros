import Link from "next/link";
import { PermissionStatus } from "@prisma/client";

import { StatusChip } from "@/components/ui/status-chip";
import { ListColumn, ListConfig } from "@/lib/list-config/types";

type FlightPlanRow = {
  id: string;
  code: string;
  title: string;
  operationDate: Date;
  permissionStatus: PermissionStatus;
  geometryType: string | null;
  costCenter: { id: string; code: string; name: string } | null;
  client: { id: string; name: string } | null;
  drone: { id: string; model: string; serialNumber: string } | null;
  operator: { id: string; fullName: string } | null;
};

const STATUS_TONES: Record<string, "success" | "warning" | "neutral" | "info" | "danger"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  READY_FOR_SUBMISSION: "warning",
  SUBMITTED: "info",
  AUTHORIZED: "success",
  OBSERVED: "warning",
  REJECTED: "danger",
  EXPIRED: "neutral",
  CLOSED: "neutral",
  CANCELLED: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  READY_FOR_SUBMISSION: "Listo para envío",
  SUBMITTED: "Enviado",
  AUTHORIZED: "Autorizado",
  OBSERVED: "Observado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

function permissionTone(status: PermissionStatus) {
  return STATUS_TONES[status] ?? "neutral";
}

export const flightPlanColumns: ListColumn<FlightPlanRow>[] = [
  {
    key: "code",
    header: "Código",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "plan",
    header: "Plan de vuelo",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.title}</p>
        <p className="text-xs text-slate-500">{row.operationDate.toISOString().slice(0, 10)}</p>
      </div>
    ),
  },
  {
    key: "assignment",
    header: "Asignación",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p className="text-xs">
          {row.costCenter ? (
            <Link href={`/cost-centers/${row.costCenter.id}`} className="transition hover:text-cyan-300">
              {row.costCenter.code}
            </Link>
          ) : (
            "—"
          )}{" "}·{" "}
          {row.client ? (
            <Link href={`/clients/${row.client.id}`} className="transition hover:text-cyan-300">
              {row.client.name}
            </Link>
          ) : (
            "—"
          )}
        </p>
        <p className="text-xs text-slate-500">
          {row.drone ? (
            <Link href={`/drones/${row.drone.id}`} className="transition hover:text-cyan-300">
              {row.drone.model}
            </Link>
          ) : (
            "—"
          )}{" / "}
          {row.operator ? (
            <Link href={`/operators/${row.operator.id}`} className="transition hover:text-cyan-300">
              {row.operator.fullName}
            </Link>
          ) : (
            "—"
          )}
        </p>
      </div>
    ),
  },
  {
    key: "geometry",
    header: "Geometría",
    render: (row) =>
      row.geometryType ? (
        <div className="space-y-1">
          <StatusChip label="Adjunta" tone="success" />
          <p className="text-xs text-slate-500">{row.geometryType}</p>
        </div>
      ) : (
        <StatusChip label="Sin adjuntar" tone="neutral" />
      ),
  },
  {
    key: "permissionStatus",
    header: "Permiso",
    render: (row) => (
      <StatusChip label={STATUS_LABELS[row.permissionStatus] ?? row.permissionStatus} tone={permissionTone(row.permissionStatus)} />
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <div className="flex gap-2">
        <Link href={`/flight-plans/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
          Editar
        </Link>
        {row.geometryType && (
          <Link
            href={`/flight-plans/${row.id}/geometry`}
            className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Geometría
          </Link>
        )}
      </div>
    ),
  },
];

export const flightPlanListConfig: ListConfig<FlightPlanRow> = {
  eyebrow: "Bloque 1 / Operación principal",
  title: "Planes de vuelo",
  description: "Gestioná los registros operativos de vuelos RPAS con flujo de permisos, geometría, documentos y clima.",
  columns: flightPlanColumns,
  filters: [
    { field: "q", label: "Buscar", type: "search", placeholder: "Código o título…" },
    {
      field: "permissionStatus",
      label: "Permiso",
      type: "select",
      placeholder: "Todos los estados",
      options: [
        { value: "DRAFT", label: "Borrador" },
        { value: "IN_REVIEW", label: "En revisión" },
        { value: "READY_FOR_SUBMISSION", label: "Listo para envío" },
        { value: "SUBMITTED", label: "Enviado" },
        { value: "AUTHORIZED", label: "Autorizado" },
        { value: "OBSERVED", label: "Observado" },
        { value: "REJECTED", label: "Rechazado" },
        { value: "EXPIRED", label: "Vencido" },
        { value: "CLOSED", label: "Cerrado" },
        { value: "CANCELLED", label: "Cancelado" },
      ],
    },
  ],
  headerActions: [
    { href: "/flight-plans/new", label: "Crear plan de vuelo", variant: "primary" },
  ],
  sidebar: {
    title: "Cobertura del plan",
    description: "Flujo de permisos, geometría, documentos y clima conectados.",
    items: [
      { label: "Flujo de permisos", value: "Completo", tone: "success" },
      { label: "Geometría", value: "Habilitada", tone: "info" },
      { label: "Documentos", value: "Habilitados", tone: "info" },
      { label: "Eliminación lógica", value: "Habilitada", tone: "success" },
    ],
    action: { href: "/flight-plans/new", label: "Crear plan" },
  },
  searchPlaceholder: "Código o título…",
  pageSize: 10,
};

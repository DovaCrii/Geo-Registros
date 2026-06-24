import Link from "next/link";
import { PermissionStatus } from "@prisma/client";

import { StatusBadge } from "@/components/ui/status-badge";
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

export const flightPlanColumns: ListColumn<FlightPlanRow>[] = [
  {
    key: "code",
    header: "Código",
    render: (row) => <span className="font-medium text-slate-900 dark:text-white">{row.code}</span>,
  },
  {
    key: "plan",
    header: "Plan de vuelo",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-slate-900 dark:text-white">{row.title}</p>
        <p className="text-xs text-slate-600 dark:text-slate-500">{row.operationDate.toISOString().slice(0, 10)}</p>
      </div>
    ),
  },
  {
    key: "assignment",
    header: "Asignación",
    render: (row) => (
      <div className="space-y-1 text-slate-700 dark:text-slate-300">
        <p className="text-xs text-slate-700 dark:text-slate-300">
          {row.costCenter ? (
              <Link href={`/cost-centers/${row.costCenter.id}`} className="transition hover:text-cyan-600 dark:hover:text-cyan-300">
              {row.costCenter.code}
            </Link>
          ) : (
            "—"
          )}{" "}·{" "}
          {row.client ? (
              <Link href={`/clients/${row.client.id}`} className="transition hover:text-cyan-600 dark:hover:text-cyan-300">
              {row.client.name}
            </Link>
          ) : (
            "—"
          )}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-500">
          {row.drone ? (
              <Link href={`/drones/${row.drone.id}`} className="transition hover:text-cyan-600 dark:hover:text-cyan-300">
              {row.drone.model}
            </Link>
          ) : (
            "—"
          )}{" / "}
          {row.operator ? (
              <Link href={`/operators/${row.operator.id}`} className="transition hover:text-cyan-600 dark:hover:text-cyan-300">
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
          <StatusBadge status="approved" label="Adjunta" size="sm" />
          <p className="text-xs text-slate-600 dark:text-slate-500">{row.geometryType}</p>
        </div>
      ) : (
        <StatusBadge status="planned" label="Sin adjuntar" size="sm" />
      ),
  },
  {
    key: "permissionStatus",
    header: "Permiso",
    render: (row) => (
      <StatusBadge
        status={
          row.permissionStatus === "AUTHORIZED"
            ? "approved"
            : row.permissionStatus === "REJECTED"
              ? "rejected"
              : row.permissionStatus === "CLOSED"
                ? "completed"
                : row.permissionStatus === "CANCELLED"
                  ? "cancelled"
                  : row.permissionStatus === "EXPIRED"
                    ? "expired"
                    : "in-review"
        }
        label={STATUS_LABELS[row.permissionStatus] ?? row.permissionStatus}
        size="sm"
      />
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    render: (row) => (
      <div className="flex gap-2">
        <Link href={`/flight-plans/${row.id}`} className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200">
          Editar
        </Link>
        {row.geometryType && (
          <Link
            href={`/flight-plans/${row.id}/geometry`}
            className="text-sm font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            Mapa operativo
          </Link>
        )}
      </div>
    ),
  },
];

export const flightPlanListConfig: ListConfig<FlightPlanRow> = {
  eyebrow: "Bloque 1 / Operación principal",
  title: "Planes de vuelo",
  description: "Gestioná los registros operativos de vuelos RPAS con flujo de permisos, mapa operativo, documentos y clima.",
  basePath: "/flight-plans",
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
  calendarView: {
    field: "operationDate",
    label: "Vista calendario",
    description: "Agrupá los planes por día para ver la carga operativa y entrar rápido al mapa de cada vuelo.",
    renderItem: (row) => (
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{row.code}</p>
            <Link href={`/flight-plans/${row.id}`} className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-cyan-600 dark:text-white dark:hover:text-cyan-300">
              {row.title}
            </Link>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">
              {row.operationDate.toLocaleDateString("es-CL", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>

          <StatusBadge
            status={
              row.permissionStatus === "AUTHORIZED"
                ? "approved"
                : row.permissionStatus === "REJECTED"
                  ? "rejected"
                  : row.permissionStatus === "CLOSED"
                    ? "completed"
                    : row.permissionStatus === "CANCELLED"
                      ? "cancelled"
                      : row.permissionStatus === "EXPIRED"
                        ? "expired"
                        : "in-review"
            }
            label={STATUS_LABELS[row.permissionStatus] ?? row.permissionStatus}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{row.costCenter ? row.costCenter.code : "Sin grupo"}</span>
          <span>·</span>
          <span>{row.client ? row.client.name : "Sin cliente"}</span>
          <span>·</span>
          <span>{row.drone ? row.drone.model : "Sin dron"}</span>
          <span>·</span>
          <span>{row.operator ? row.operator.fullName : "Sin operador"}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link href={`/flight-plans/${row.id}`} className="text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200">
            Editar
          </Link>
          {row.geometryType && (
            <Link href={`/flight-plans/${row.id}/geometry`} className="text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200">
              Abrir mapa
            </Link>
          )}
        </div>
      </div>
    ),
  },
  sidebar: {
    title: "Cobertura del plan",
    description: "Flujo de permisos, mapa operativo, documentos y clima conectados.",
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

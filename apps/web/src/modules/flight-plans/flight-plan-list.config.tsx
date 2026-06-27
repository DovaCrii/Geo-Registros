import type { PermissionStatus } from "@prisma/client";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import type { ListColumn, ListConfig } from "@/lib/list-config/types";

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
        <p className="text-xs text-slate-600 dark:text-slate-500">
          {row.operationDate.toISOString().slice(0, 10)}
        </p>
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
            <Link
              href={`/cost-centers/${row.costCenter.id}`}
              className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
            >
              {row.costCenter.code}
            </Link>
          ) : (
            "—"
          )}{" "}
          ·{" "}
          {row.client ? (
            <Link
              href={`/clients/${row.client.id}`}
              className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
            >
              {row.client.name}
            </Link>
          ) : (
            "—"
          )}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-500">
          {row.drone ? (
            <Link
              href={`/drones/${row.drone.id}`}
              className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
            >
              {row.drone.model}
            </Link>
          ) : (
            "—"
          )}
          {" / "}
          {row.operator ? (
            <Link
              href={`/operators/${row.operator.id}`}
              className="transition hover:text-cyan-600 dark:hover:text-cyan-300"
            >
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
        <Link
          href={`/flight-plans/${row.id}`}
          className="text-sm font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
        >
          Editar
        </Link>
        {row.geometryType && (
          <Link
            href={`/flight-plans/${row.id}/geometry`}
            className="text-sm font-medium text-emerald-700 transition hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            Geometría
          </Link>
        )}
      </div>
    ),
  },
];

export const flightPlanListConfig: ListConfig<FlightPlanRow> = {
  emptyState: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L10 16L18 8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      </svg>
    ),
    title: "No hay planes de vuelo",
    description: "Los planes de vuelo son el centro de la operación. Cread uno nuevo para activar el flujo completo de permisos, geometría, documentos y seguimiento.",
    steps: [
      { number: 1, label: "Registrá un dron y un operador", description: "Antes de crear un plan necesitás tener al menos un dron y un operador activos." },
      { number: 2, label: "Creá el plan de vuelo", description: "Completá los datos básicos: fecha, cliente, grupo de trabajo y tipo de operación." },
      { number: 3, label: "Seguí el flujo operacional", description: "Agregá geometría, documentos y permisos paso a paso desde el detalle del plan." },
    ],
  },

  eyebrow: "Bloque 1 / Operación principal",
  title: "Planes de vuelo",
  description:
    "Gestioná los registros operativos de vuelos RPAS con flujo de permisos, geometría, documentos y clima.",
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
  headerActions: [{ href: "/flight-plans/new", label: "Crear plan de vuelo", variant: "primary" }],
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

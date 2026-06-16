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

function permissionTone(status: PermissionStatus) {
  return STATUS_TONES[status] ?? "neutral";
}

export const flightPlanColumns: ListColumn<FlightPlanRow>[] = [
  {
    key: "code",
    header: "Code",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "plan",
    header: "Flight plan",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.title}</p>
        <p className="text-xs text-slate-500">{row.operationDate.toISOString().slice(0, 10)}</p>
      </div>
    ),
  },
  {
    key: "assignment",
    header: "Assignment",
    render: (row) => (
      <div className="space-y-1 text-slate-300">
        <p className="text-xs">
          {row.costCenter?.code ?? "—"} · {row.client?.name ?? "—"}
        </p>
        <p className="text-xs text-slate-500">
          {row.drone?.model ?? "—"} / {row.operator?.fullName ?? "—"}
        </p>
      </div>
    ),
  },
  {
    key: "geometry",
    header: "Geometry",
    render: (row) =>
      row.geometryType ? (
        <div className="space-y-1">
          <StatusChip label="Attached" tone="success" />
          <p className="text-xs text-slate-500">{row.geometryType}</p>
        </div>
      ) : (
        <StatusChip label="Missing" tone="neutral" />
      ),
  },
  {
    key: "permissionStatus",
    header: "Permission",
    render: (row) => (
      <StatusChip label={row.permissionStatus.replace(/_/g, " ")} tone={permissionTone(row.permissionStatus)} />
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (row) => (
      <div className="flex gap-2">
        <Link href={`/flight-plans/${row.id}`} className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
          Edit
        </Link>
        {row.geometryType && (
          <Link
            href={`/flight-plans/${row.id}/geometry`}
            className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Geometry
          </Link>
        )}
      </div>
    ),
  },
];

export const flightPlanListConfig: ListConfig<FlightPlanRow> = {
  eyebrow: "Block 1 / Core operation",
  title: "Flight plans",
  description: "Manage operational RPA flight records with full permission workflow, geometry capture, documents, and weather.",
  columns: flightPlanColumns,
  filters: [
    { field: "q", label: "Search", type: "search", placeholder: "Código o título…" },
    {
      field: "permissionStatus",
      label: "Permission",
      type: "select",
      placeholder: "All statuses",
      options: [
        { value: "DRAFT", label: "Draft" },
        { value: "IN_REVIEW", label: "In review" },
        { value: "READY_FOR_SUBMISSION", label: "Ready for submission" },
        { value: "SUBMITTED", label: "Submitted" },
        { value: "AUTHORIZED", label: "Authorized" },
        { value: "OBSERVED", label: "Observed" },
        { value: "REJECTED", label: "Rejected" },
        { value: "EXPIRED", label: "Expired" },
        { value: "CLOSED", label: "Closed" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
    },
  ],
  actions: {
    create: { href: "/flight-plans/new", label: "Create flight plan" },
  },
  sidebar: {
    title: "Current slice scope",
    description: "Full permission workflow, geometry, documents, and weather integration.",
    items: [
      { label: "Permission workflow", value: "Complete", tone: "success" },
      { label: "Geometry", value: "Enabled", tone: "info" },
      { label: "Documents", value: "Enabled", tone: "info" },
      { label: "Soft delete", value: "Enabled", tone: "success" },
    ],
    action: { href: "/flight-plans/new", label: "Open create form" },
  },
  searchPlaceholder: "Código o título…",
  pageSize: 10,
};

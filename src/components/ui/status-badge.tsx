"use client";

import type { ReactNode } from "react";

/**
 * Estados operacionales de AeroFlow.
 * Cada estado tiene color, ícono y label por defecto.
 */
export type OperationalStatus =
  | "planned"
  | "in-review"
  | "approved"
  | "rejected"
  | "in-execution"
  | "completed"
  | "cancelled"
  | "expired";

const statusConfig: Record<
  OperationalStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  planned: {
    label: "Planificado",
    dot: "bg-accent",
    bg: "bg-accent/10",
    text: "text-accent",
  },
  "in-review": {
    label: "En revisión",
    dot: "bg-status-warning",
    bg: "bg-status-warning/10",
    text: "text-status-warning",
  },
  approved: {
    label: "Aprobado",
    dot: "bg-status-success",
    bg: "bg-status-success/10",
    text: "text-status-success",
  },
  rejected: {
    label: "Rechazado",
    dot: "bg-status-danger",
    bg: "bg-status-danger/10",
    text: "text-status-danger",
  },
  "in-execution": {
    label: "En ejecución",
    dot: "bg-accent",
    bg: "bg-accent/10",
    text: "text-accent",
  },
  completed: {
    label: "Completado",
    dot: "bg-status-success",
    bg: "bg-status-success/10",
    text: "text-status-success",
  },
  cancelled: {
    label: "Cancelado",
    dot: "bg-slate-400 dark:bg-slate-500",
    bg: "bg-slate-400/10 dark:bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
  },
  expired: {
    label: "Vencido",
    dot: "bg-status-danger",
    bg: "bg-status-danger/10",
    text: "text-status-danger",
  },
};

interface StatusBadgeProps {
  status: OperationalStatus;
  label?: string;
  /** @default "md" */
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  const fontSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded ${padding} ${fontSize} font-medium leading-none ${config.bg} ${config.text}`}
    >
      <span className={`inline-block rounded-full ${dotSize} ${config.dot}`} />
      {label ?? config.label}
    </span>
  );
}

// ─── Icon helpers ────────────────────────────────────────────

export function StatusIcon({ status }: { status: OperationalStatus }): ReactNode {
  // Each status maps to a lucide icon name for documentation clarity.
  // Usage: <StatusIcon status="approved" />
  const iconMap: Record<OperationalStatus, string> = {
    planned: "FileText",
    "in-review": "Clock",
    approved: "CheckCircle",
    rejected: "XCircle",
    "in-execution": "PlayCircle",
    completed: "CheckCircle",
    cancelled: "Slash",
    expired: "AlertTriangle",
  };
  return <span className="text-xs text-slate-400">{iconMap[status]}</span>;
}

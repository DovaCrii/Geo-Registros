"use client";

import type { ReactNode } from "react";

/**
 * StatusBadge uses 5 visual variants and maps the operational states into them.
 * This keeps the UI consistent without losing compatibility with the existing workflow statuses.
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

type StatusVariant = "neutral" | "info" | "success" | "warning" | "danger";

const statusConfig: Record<
  StatusVariant,
  { label: string; dot: string; bg: string; text: string }
> = {
  neutral: {
    label: "Planificado",
    dot: "bg-slate-400 dark:bg-slate-500",
    bg: "bg-slate-100 dark:bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
  },
  info: {
    label: "En revisión",
    dot: "bg-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  success: {
    label: "Aprobado",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    label: "Pendiente",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    label: "Rechazado",
    dot: "bg-rose-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-300",
  },
};

const statusVariantByOperationalStatus: Record<OperationalStatus, StatusVariant> = {
  planned: "neutral",
  "in-review": "info",
  approved: "success",
  rejected: "danger",
  "in-execution": "info",
  completed: "success",
  cancelled: "neutral",
  expired: "warning",
};

const statusIconMap: Record<OperationalStatus, string> = {
  planned: "FileText",
  "in-review": "Clock",
  approved: "CheckCircle",
  rejected: "XCircle",
  "in-execution": "PlayCircle",
  completed: "CheckCircle",
  cancelled: "Slash",
  expired: "AlertTriangle",
};

function getStatusBadgeSizeClasses(size: "sm" | "md") {
  return {
    dotSize: size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
    padding: size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5",
    fontSize: size === "sm" ? "text-[11px]" : "text-xs",
  };
}

interface StatusBadgeProps {
  status: OperationalStatus;
  label?: string;
  /** @default "md" */
  size?: "sm" | "md";
}

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[statusVariantByOperationalStatus[status]];
  const { dotSize, padding, fontSize } = getStatusBadgeSizeClasses(size);

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
  return <span className="text-xs text-slate-500 dark:text-slate-400">{statusIconMap[status]}</span>;
}

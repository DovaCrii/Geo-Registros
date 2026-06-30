"use client";

import type { ReactNode } from "react";

import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon } from "@/components/ui/linear-icons";

type AlertSeverity = "info" | "warning" | "error" | "success";

interface AlertCardProps {
  severity: AlertSeverity;
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

const severityConfig: Record<
  AlertSeverity,
  { border: string; icon: ReactNode; bg: string; iconBox: string }
> = {
  info: {
    border: "border-l-accent",
    icon: <InfoIcon className="h-4 w-4" />,
    bg: "bg-accent/5 dark:bg-accent/10",
    iconBox: "bg-accent/10 text-accent dark:bg-cyan-500/15 dark:text-cyan-200",
  },
  warning: {
    border: "border-l-status-warning",
    icon: <WarningIcon className="h-4 w-4" />,
    bg: "bg-status-warning/5 dark:bg-status-warning/10",
    iconBox: "bg-status-warning/10 text-status-warning dark:bg-amber-500/15 dark:text-amber-200",
  },
  error: {
    border: "border-l-status-danger",
    icon: <XCircleIcon className="h-4 w-4" />,
    bg: "bg-status-danger/5 dark:bg-status-danger/10",
    iconBox: "bg-status-danger/10 text-status-danger dark:bg-rose-500/15 dark:text-rose-200",
  },
  success: {
    border: "border-l-status-success",
    icon: <CheckCircleIcon className="h-4 w-4" />,
    bg: "bg-status-success/5 dark:bg-status-success/10",
    iconBox: "bg-status-success/10 text-status-success dark:bg-emerald-500/15 dark:text-emerald-200",
  },
};

/**
 * AlertCard — barra izquierda de 4px + icono + mensaje.
 * Sin bordes completos, solo la línea lateral.
 */
export function AlertCard({
  severity,
  title,
  message,
  action,
  className = "",
}: AlertCardProps) {
  const config = severityConfig[severity];

  return (
    <div
      role="status"
      className={`rounded-r-xl border-y border-r border-slate-200/70 border-l-4 ${config.border} ${config.bg} px-4 py-3 shadow-sm shadow-slate-900/5 dark:border-slate-800/70 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${config.iconBox}`} aria-hidden="true">
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {title}
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

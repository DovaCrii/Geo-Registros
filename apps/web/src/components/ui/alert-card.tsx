"use client";

import type { ReactNode } from "react";

type AlertSeverity = "info" | "warning" | "error" | "success";

interface AlertCardProps {
  severity: AlertSeverity;
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

const severityConfig: Record<AlertSeverity, { border: string; icon: string; bg: string }> = {
  info: {
    border: "border-l-accent",
    icon: "\u2139\uFE0F",
    bg: "bg-accent/5 dark:bg-accent/10",
  },
  warning: {
    border: "border-l-status-warning",
    icon: "\u26A0\uFE0F",
    bg: "bg-status-warning/5 dark:bg-status-warning/10",
  },
  error: {
    border: "border-l-status-danger",
    icon: "\u2716\uFE0F",
    bg: "bg-status-danger/5 dark:bg-status-danger/10",
  },
  success: {
    border: "border-l-status-success",
    icon: "\u2714\uFE0F",
    bg: "bg-status-success/5 dark:bg-status-success/10",
  },
};

/**
 * AlertCard — barra izquierda de 4px + icono + mensaje.
 * Sin bordes completos, solo la línea lateral.
 */
export function AlertCard({ severity, title, message, action, className = "" }: AlertCardProps) {
  const config = severityConfig[severity];

  return (
    <div
      role="status"
      className={`border-l-4 ${config.border} ${config.bg} rounded-r-lg px-4 py-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-base leading-none" role="img" aria-hidden="true">
          {config.icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-semibold text-slate-800 dark:text-white">{title}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

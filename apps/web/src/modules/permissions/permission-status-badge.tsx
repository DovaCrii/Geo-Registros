type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_CONFIG: Record<string, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "Borrador", tone: "neutral" },
  IN_REVIEW: { label: "En revisión", tone: "info" },
  READY_FOR_SUBMISSION: { label: "Listo para envío", tone: "info" },
  SUBMITTED: { label: "Enviado", tone: "info" },
  AUTHORIZED: { label: "Autorizado", tone: "success" },
  OBSERVED: { label: "Observado", tone: "warning" },
  REJECTED: { label: "Rechazado", tone: "danger" },
  EXPIRED: { label: "Vencido", tone: "danger" },
  CLOSED: { label: "Cerrado", tone: "neutral" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
};

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  danger: "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  info: "border-cyan-500/30 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  neutral: "border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300",
};

export function PermissionStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: "neutral" as StatusTone };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${toneClasses[config.tone]}`}
    >
      {config.label}
    </span>
  );
}

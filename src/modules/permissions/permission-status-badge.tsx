type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const STATUS_CONFIG: Record<string, { label: string; tone: StatusTone }> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  IN_REVIEW: { label: "In review", tone: "info" },
  READY_FOR_SUBMISSION: { label: "Ready for submission", tone: "info" },
  SUBMITTED: { label: "Submitted", tone: "info" },
  AUTHORIZED: { label: "Authorized", tone: "success" },
  OBSERVED: { label: "Observed", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
  EXPIRED: { label: "Expired", tone: "danger" },
  CLOSED: { label: "Closed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
};

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  neutral: "border-slate-700 bg-slate-800/80 text-slate-300",
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

type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

/**
 * StatusChip — legacy component for light/dark compatibility.
 * @deprecated Prefer StatusBadge for operational workflow states.
 */
const toneClasses: Record<StatusTone, string> = {
  success:
    "border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/30 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  danger:
    "border-rose-500/30 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-cyan-500/30 dark:border-cyan-500/30 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  neutral:
    "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300",
};

export function StatusChip({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

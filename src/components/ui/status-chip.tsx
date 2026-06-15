type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  neutral: "border-slate-700 bg-slate-800/80 text-slate-300",
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

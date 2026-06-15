import { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-4">{children}</div>
    </section>
  );
}

export function FilterField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

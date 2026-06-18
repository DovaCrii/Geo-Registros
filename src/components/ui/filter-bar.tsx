import { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Filtros" className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-5 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

export function FilterField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">{label}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
      />
    </label>
  );
}

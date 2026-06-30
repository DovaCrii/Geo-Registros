import { ReactNode } from "react";

import { uiCardRadius, uiKicker, uiSurface } from "@/components/ui/design-tokens";

const FILTER_BAR_SHELL = `${uiCardRadius} ${uiSurface} p-5`;
const FILTER_BAR_GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";
const FILTER_LABEL = uiKicker;
const FILTER_CONTROL =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Filtros" className={FILTER_BAR_SHELL}>
      <div className={FILTER_BAR_GRID}>{children}</div>
    </section>
  );
}

export function FilterField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="space-y-2">
      <span className={FILTER_LABEL}>{label}</span>
      <input type="text" placeholder={placeholder} className={FILTER_CONTROL} />
    </label>
  );
}

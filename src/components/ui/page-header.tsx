import { ReactNode } from "react";

import { uiCardRadius, uiSurface } from "@/components/ui/design-tokens";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className={`${uiCardRadius} ${uiSurface} p-6`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-strong dark:text-cyan-300">{eyebrow}</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

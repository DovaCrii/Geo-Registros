import type { ReactNode } from "react";

export function DetailPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="space-y-4 pt-5">{children}</div>
    </aside>
  );
}

import { ReactNode } from "react";

const DETAIL_PANEL_SHELL =
  "rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10";
const DETAIL_PANEL_HEADER = "space-y-2 border-b border-slate-200 dark:border-slate-800/80 pb-4";
const DETAIL_PANEL_TITLE = "text-lg font-semibold text-slate-900 dark:text-white";
const DETAIL_PANEL_DESCRIPTION = "text-sm leading-6 text-slate-500 dark:text-slate-400";

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
    <aside className={DETAIL_PANEL_SHELL}>
      <div className={DETAIL_PANEL_HEADER}>
        <h2 className={DETAIL_PANEL_TITLE}>{title}</h2>
        <p className={DETAIL_PANEL_DESCRIPTION}>{description}</p>
      </div>
      <div className="space-y-4 pt-5">{children}</div>
    </aside>
  );
}

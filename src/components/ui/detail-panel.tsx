import { ReactNode } from "react";

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
    <aside className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="space-y-2 border-b border-slate-800/80 pb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <div className="space-y-4 pt-5">{children}</div>
    </aside>
  );
}

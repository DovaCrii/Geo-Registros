import { ReactNode } from "react";

type HelpHintProps = {
  label?: string;
  title: string;
  children: ReactNode;
};

export function HelpHint({ label = "Ayuda", title, children }: HelpHintProps) {
  return (
    <span className="relative inline-flex align-middle group">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[10px] font-bold text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-cyan-300"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl shadow-slate-950/10 group-hover:block group-focus-within:block dark:border-slate-800 dark:bg-slate-950">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-300">{children}</span>
      </span>
    </span>
  );
}

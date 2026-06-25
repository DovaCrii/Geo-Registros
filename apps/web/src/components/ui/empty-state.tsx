import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  steps?: Array<{
    number: number;
    label: string;
    description?: string;
  }>;
};

export function EmptyState({ icon, title, description, action, steps }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-8 text-center shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-accent dark:border-slate-700/60 dark:bg-slate-950/70 dark:text-cyan-300">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>

      {action && (
        <a
          href={action.href}
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20"
        >
          {action.label}
        </a>
      )}

      {steps && steps.length > 0 && (
        <div className="mt-6 space-y-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
            Pasos para empezar
          </p>
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/10 text-xs font-semibold text-accent-strong dark:text-cyan-300">
                {step.number}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{step.label}</p>
                {step.description && (
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

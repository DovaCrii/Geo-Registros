import { ReactNode } from "react";

import { uiBodyText, uiCardRadius, uiFocusRing, uiKicker, uiPrimaryAction, uiSecondaryAction, uiSurface } from "@/components/ui/design-tokens";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  steps?: Array<{
    number: number;
    label: string;
    description?: string;
  }>;
};

const EMPTY_STATE_ACTION_BASE = `inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium transition ${uiFocusRing}`;
const EMPTY_STATE_PRIMARY_ACTION = uiPrimaryAction;
const EMPTY_STATE_SECONDARY_ACTION = uiSecondaryAction;
const EMPTY_STATE_STEP_BASE = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold";
const EMPTY_STATE_STEP_TONE = "border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/10 text-accent-strong dark:text-cyan-300";

export function EmptyState({ icon, title, description, action, secondaryAction, steps }: EmptyStateProps) {
  return (
    <div className={`${uiCardRadius} ${uiSurface} p-8 text-left`}>
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-accent dark:border-slate-700/60 dark:bg-slate-950/70 dark:text-cyan-300">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className={`mt-2 max-w-2xl ${uiBodyText}`}>{description}</p>

      {action && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={action.href} className={`${EMPTY_STATE_ACTION_BASE} ${EMPTY_STATE_PRIMARY_ACTION}`}>
            {action.label}
          </a>
          {secondaryAction && (
            <a href={secondaryAction.href} className={`${EMPTY_STATE_ACTION_BASE} ${EMPTY_STATE_SECONDARY_ACTION}`}>
              {secondaryAction.label}
            </a>
          )}
        </div>
      )}

      {steps && steps.length > 0 && (
        <div className="mt-6 space-y-3 text-left">
          <p className={uiKicker}>Pasos para empezar</p>
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-3">
              <span className={`${EMPTY_STATE_STEP_BASE} ${EMPTY_STATE_STEP_TONE}`}>{step.number}</span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{step.label}</p>
                {step.description && (
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

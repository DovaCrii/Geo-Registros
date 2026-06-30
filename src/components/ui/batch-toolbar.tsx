"use client";

import { useCallback, useState } from "react";
import type { BatchAction } from "@/lib/list-config/types";
import { uiFocusRing, uiPrimaryAction, uiSurface } from "@/components/ui/design-tokens";

type BatchToolbarProps = {
  selectedCount: number;
  actions: BatchAction[];
  onAction: (handler: string) => Promise<void>;
  onClear: () => void;
};

const ACTION_BASE = `inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${uiFocusRing}`;
const ACTION_VARIANTS: Record<string, string> = {
  primary: uiPrimaryAction,
  danger:
    "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:border-red-300/50 dark:hover:bg-red-400/20",
  warning:
    "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:border-amber-300/50 dark:hover:bg-amber-400/20",
};

export function BatchToolbar({ selectedCount, actions, onAction, onClear }: BatchToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = useCallback(
    async (handler: string) => {
      setLoading(handler);
      try {
        await onAction(handler);
      } finally {
        setLoading(null);
      }
    },
    [onAction],
  );

  if (selectedCount === 0) return null;

  return (
    <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${uiSurface}`}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {selectedCount} seleccionados
      </span>

      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const variant = ACTION_VARIANTS[action.variant ?? "primary"] ?? ACTION_VARIANTS.primary;
          const isBusy = loading === action.handler;

          return (
            <button
              key={action.handler}
              type="button"
              disabled={isBusy}
              onClick={() => handleAction(action.handler)}
              className={`${ACTION_BASE} ${variant} disabled:opacity-50`}
            >
              {isBusy ? "Procesando…" : action.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className={`ml-auto rounded-md text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-800 hover:decoration-slate-500 dark:text-slate-500 dark:decoration-slate-700 dark:hover:text-slate-300 dark:hover:decoration-slate-500 ${uiFocusRing}`}
      >
        Limpiar selección
      </button>
    </div>
  );
}

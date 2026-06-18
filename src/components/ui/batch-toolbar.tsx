"use client";

import { useCallback, useState } from "react";
import type { BatchAction } from "@/lib/list-config/types";

type BatchToolbarProps = {
  selectedCount: number;
  actions: BatchAction[];
  onAction: (handler: string) => Promise<void>;
  onClear: () => void;
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
    <div className="flex items-center gap-3 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800/40 dark:bg-cyan-950/60">
      <span className="text-sm font-medium text-cyan-700 dark:text-cyan-200">
        {selectedCount} seleccionados
      </span>

      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const base =
            "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition";
          const variants: Record<string, string> = {
            primary: "border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 text-accent-strong dark:text-cyan-100 hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20",
            danger: "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-200 dark:hover:border-red-300/50 dark:hover:bg-red-400/20",
            warning: "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:border-amber-300/50 dark:hover:bg-amber-400/20",
          };
          const variant = variants[action.variant ?? "primary"] ?? variants.primary;
          const isBusy = loading === action.handler;

          return (
            <button
              key={action.handler}
              type="button"
              disabled={isBusy}
              onClick={() => handleAction(action.handler)}
              className={`${base} ${variant} disabled:opacity-50`}
            >
              {isBusy ? "Procesando…" : action.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-xs text-slate-600 underline transition hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
      >
        Limpiar selección
      </button>
    </div>
  );
}

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
    <div className="flex items-center gap-3 rounded-2xl border border-cyan-800/40 bg-cyan-950/60 px-4 py-3 backdrop-blur">
      <span className="text-sm font-medium text-cyan-200">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const base =
            "inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-medium transition";
          const variants: Record<string, string> = {
            primary: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-400/20",
            danger: "border-red-400/30 bg-red-500/15 text-red-200 hover:border-red-300/50 hover:bg-red-400/20",
            warning: "border-amber-400/30 bg-amber-500/15 text-amber-200 hover:border-amber-300/50 hover:bg-amber-400/20",
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
              {isBusy ? "Processing…" : action.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-xs text-slate-500 underline transition hover:text-slate-300"
      >
        Clear selection
      </button>
    </div>
  );
}

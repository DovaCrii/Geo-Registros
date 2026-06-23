"use client";

import { useMemo, useState } from "react";

import { DetailPanel } from "@/components/ui/detail-panel";
import { HelpHint } from "@/components/ui/help-hint";
import { useToast } from "@/lib/toast-context";
import {
  DGAC_CHECKLIST_ITEMS,
  normalizeChecklist,
} from "@/modules/dgac/checklist-items";

export function FlightPlanChecklist({
  flightPlanId,
  initialChecklist,
  suggestedChecklist,
  geometryLink,
  canEdit = true,
}: {
  flightPlanId: string;
  initialChecklist?: unknown;
  suggestedChecklist?: unknown;
  /** When set, shows a link to the geometry page for the "operation-area" item. */
  geometryLink?: string;
  canEdit?: boolean;
}) {
  const items = useMemo(() => DGAC_CHECKLIST_ITEMS, []);
  const { toast } = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => ({
    ...normalizeChecklist(suggestedChecklist),
    ...normalizeChecklist(initialChecklist),
  }));
  const [saving, setSaving] = useState<string | null>(null);

  const done = items.filter((item) => checked[item.id]).length;

  async function persist(next: Record<string, boolean>) {
    setSaving("saving");
    try {
      const response = await fetch(`/api/flight-plans/${flightPlanId}/dgac-checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: next }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "No se pudo guardar la checklist.");
      }

      toast("success", "Checklist guardada", "El estado DGAC del plan quedó persistido.");
    } catch (error) {
      toast("error", "Error al guardar", error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setSaving(null);
    }
  }

  return (
    <DetailPanel
      title="Checklist operativo DGAC"
      description="Seguimiento por plan de vuelo con persistencia real en la base."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Progreso</p>
            <p className="text-xs text-slate-600 dark:text-slate-500">{done} de {items.length} completados</p>
          </div>
          <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{Math.round((done / items.length) * 100)}%</div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50 px-4 py-3 text-xs leading-5 text-cyan-700 dark:bg-cyan-500/[0.04] dark:text-cyan-100">
          La parte superior se autocompleta con datos reales del plan. Lo manual queda guardado como override operativo.
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = Boolean(checked[item.id]);
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                  isChecked
                    ? "border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.04]"
                    : "border-slate-200 bg-white/90 hover:border-cyan-500/20 dark:border-slate-800/80 dark:bg-slate-950/45"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(event) => {
                    const next = { ...checked, [item.id]: event.target.checked };
                    setChecked(next);
                    void persist(next);
                  }}
                  disabled={!canEdit || saving !== null}
                  className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-cyan-500 focus:ring-cyan-400/40 dark:border-slate-600 dark:bg-slate-950 dark:text-cyan-400"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                    <HelpHint label={`Ayuda: ${item.label}`} title={item.hint} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-500">{item.hint}</p>
                  {item.id === "operation-area" && geometryLink && (
                    <a
                      href={geometryLink}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-cyan-700 transition hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Ver área de operación
                    </a>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        <p className="text-xs leading-5 text-slate-600 dark:text-slate-500">
          Esta checklist es un apoyo interno. No reemplaza normativa oficial DGAC ni revisiones operativas obligatorias.
        </p>

        {!canEdit ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            Tu perfil puede revisar la checklist, pero no modificarla.
          </p>
        ) : null}
      </div>
    </DetailPanel>
  );
}

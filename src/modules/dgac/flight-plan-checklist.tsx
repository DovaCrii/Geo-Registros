"use client";

import { useMemo, useState } from "react";

import { DetailPanel } from "@/components/ui/detail-panel";
import { useToast } from "@/lib/toast-context";
import { DGAC_CHECKLIST_ITEMS, normalizeChecklist } from "@/modules/dgac/checklist-items";

export function FlightPlanChecklist({
  flightPlanId,
  initialChecklist,
}: {
  flightPlanId: string;
  initialChecklist?: unknown;
}) {
  const items = useMemo(() => DGAC_CHECKLIST_ITEMS, []);
  const { toast } = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    normalizeChecklist(initialChecklist),
  );
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
        <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Progreso</p>
            <p className="text-xs text-slate-500">{done} de {items.length} completados</p>
          </div>
          <div className="text-sm font-semibold text-cyan-300">{Math.round((done / items.length) * 100)}%</div>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const isChecked = Boolean(checked[item.id]);
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                  isChecked
                    ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                    : "border-slate-800/80 bg-slate-950/45 hover:border-cyan-500/20"
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
                  disabled={saving !== null}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 focus:ring-cyan-400/40"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.hint}</p>
                </div>
              </label>
            );
          })}
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Esta checklist es un apoyo interno. No reemplaza normativa oficial DGAC ni revisiones operativas obligatorias.
        </p>
      </div>
    </DetailPanel>
  );
}

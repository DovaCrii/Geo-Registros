"use client";

import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/lib/toast-context";

type ReviewSummaryItem = {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
};

export function ReviewerNotes({
  flightPlanId,
  summary,
  missingItems,
}: {
  flightPlanId: string;
  summary: ReviewSummaryItem[];
  missingItems: string[];
}) {
  const { toast } = useToast();
  const storageKey = useMemo(() => `review-notes:${flightPlanId}`, [flightPlanId]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      setNotes(window.localStorage.getItem(storageKey) ?? "");
    } catch {
      setNotes("");
    }
  }, [storageKey]);

  function handleSave() {
    try {
      window.localStorage.setItem(storageKey, notes);
      toast("success", "Notas guardadas", "El borrador del revisor quedó almacenado en este navegador.");
    } catch {
      toast("error", "No se pudieron guardar las notas", "Probá nuevamente o revisá el almacenamiento del navegador.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent dark:text-cyan-300">Modo revisor</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Comparación y comentarios</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Esta vista es solo lectura: resume el estado actual y deja un borrador de observaciones para el equipo operativo.
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/20 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
          Revisión
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const toneClass =
            item.tone === "success"
              ? "border-emerald-500/20 bg-emerald-50/80 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"
              : item.tone === "warning"
                ? "border-amber-500/20 bg-amber-50/80 text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100"
                : item.tone === "danger"
                  ? "border-rose-500/20 bg-rose-50/80 text-rose-900 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-100"
                  : "border-slate-200 bg-slate-50/80 text-slate-900 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-100";

          return (
            <div key={item.label} className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Observaciones del revisor</p>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          placeholder="Anotá hallazgos, dudas o próximos pasos…"
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {missingItems.length > 0
              ? `Faltan ${missingItems.length} ítems DGAC: ${missingItems.join(", ")}.`
              : "No hay faltantes DGAC detectados en el checklist actual."}
          </p>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-strong transition hover:border-accent/50 hover:bg-accent/15 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
          >
            Guardar borrador
          </button>
        </div>
      </div>
    </div>
  );
}

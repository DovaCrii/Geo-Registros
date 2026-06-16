"use client";

import { useEffect, useMemo, useState } from "react";

import { DetailPanel } from "@/components/ui/detail-panel";

type ChecklistItem = {
  id: string;
  label: string;
  hint: string;
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "drone-registered", label: "Dron registrado", hint: "Verificá que el equipo esté cargado en flota." },
  { id: "operator-valid", label: "Operador con credencial vigente", hint: "Confirmá licencia, identidad y vigencia." },
  { id: "client-assigned", label: "Cliente asignado", hint: "Debe existir un mandante o contrato asociado." },
  { id: "costcenter-assigned", label: "Centro de costo asignado", hint: "Usado para trazabilidad financiera y operativa." },
  { id: "operation-area", label: "Área de operación definida", hint: "Geometría cargada o pendiente de revisión." },
  { id: "date-defined", label: "Fecha y horario definidos", hint: "Evita ambigüedad en la autorización." },
  { id: "population-check", label: "Zona poblada / no poblada evaluada", hint: "Clasificá el contexto antes de enviar." },
  { id: "documents-attached", label: "Documentos adjuntos", hint: "Seguro, credencial y respaldos mínimos." },
  { id: "weather-check", label: "Evaluación meteorológica", hint: "Revisá viento, temperatura y precipitaciones." },
  { id: "restriction-check", label: "Restricciones evaluadas", hint: "Espacio aéreo, servidumbres, áreas sensibles." },
  { id: "ready-to-send", label: "Permiso listo para revisión", hint: "Checklist completo antes del envío DGAC." },
];

function storageKey(flightPlanId: string) {
  return `aeroflow.dgac.checklist.${flightPlanId}`;
}

export function FlightPlanChecklist({ flightPlanId }: { flightPlanId: string }) {
  const items = useMemo(() => DEFAULT_ITEMS, []);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(flightPlanId));
      if (raw) setChecked(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // ignore malformed local state
    }
  }, [flightPlanId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(flightPlanId), JSON.stringify(checked));
    } catch {
      // ignore storage errors
    }
  }, [checked, flightPlanId]);

  const done = items.filter((item) => checked[item.id]).length;

  return (
    <DetailPanel
      title="Checklist operativo DGAC"
      description="Seguimiento simple por plan de vuelo. La persistencia es local por navegador en esta primera versión."
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
                  onChange={(event) =>
                    setChecked((prev) => ({
                      ...prev,
                      [item.id]: event.target.checked,
                    }))
                  }
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

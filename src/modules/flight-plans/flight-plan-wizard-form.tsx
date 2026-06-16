"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { DetailPanel } from "@/components/ui/detail-panel";
import { SubmitButton } from "@/components/ui/submit-button";

type Option = {
  id: string;
  label: string;
};

type FlightPlanFormValues = {
  code: string;
  title: string;
  operationDate: string;
  notes: string;
  geometryPayload: string;
  costCenterId: string;
  clientId: string;
  droneId: string;
  operatorId: string;
};

const STEPS = [
  { label: "Datos generales", description: "Identificación y fecha de operación." },
  { label: "Asignación", description: "Centro de costo, cliente, dron y operador." },
  { label: "Área de operación", description: "Contexto operativo y geometría base." },
  { label: "Documentación", description: "Respaldos mínimos antes de revisión DGAC." },
  { label: "Checklist DGAC / cliente", description: "Validación previa al envío." },
  { label: "Revisión final", description: "Resumen y guardado del plan de vuelo." },
] as const;

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Option[];
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        name={name}
        required
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
      >
        <option value="" disabled>
          Seleccioná {label.toLowerCase()}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StepBadge({ current, step }: { current: number; step: number }) {
  const active = current === step;
  const done = current > step;

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition ${
        done
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
          : active
            ? "border-cyan-500/30 bg-cyan-500/15 text-cyan-200"
            : "border-slate-800 bg-slate-950/70 text-slate-500"
      }`}
    >
      {step + 1}
    </div>
  );
}

export function FlightPlanWizardForm({
  title,
  description,
  action,
  submitLabel,
  initialValues,
  costCenterOptions,
  clientOptions,
  droneOptions,
  operatorOptions,
  geometrySummary,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValues: FlightPlanFormValues;
  costCenterOptions: Option[];
  clientOptions: Option[];
  droneOptions: Option[];
  operatorOptions: Option[];
  geometrySummary?: string;
}) {
  const [step, setStep] = useState(0);
  const [showAdvancedGeoJson, setShowAdvancedGeoJson] = useState(false);
  const [payload, setPayload] = useState(initialValues.geometryPayload);

  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  const checklist = useMemo(
    () => [
      "Operador con credencial vigente",
      "Dron con documentación al día",
      "Área de operación definida",
      "Documentos mínimos adjuntos",
      "Checklist DGAC revisado",
    ],
    [],
  );

  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((item, index) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 transition ${
                step === index
                  ? "border-cyan-500/30 bg-cyan-500/[0.05]"
                  : step > index
                    ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                    : "border-slate-800/80 bg-slate-950/45"
              }`}
            >
              <div className="flex items-start gap-3">
                <StepBadge current={step} step={index} />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <input type="hidden" name="geometryPayload" value={payload} />

        <section className={step === 0 ? "space-y-4" : "hidden"}>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Código interno</span>
            <input
              type="text"
              name="code"
              required
              defaultValue={initialValues.code}
              placeholder="FP-2026-001"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Título</span>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialValues.title}
              placeholder="Inspección corredor norte"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Fecha de operación</span>
            <input
              type="date"
              name="operationDate"
              required
              defaultValue={initialValues.operationDate}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>
        </section>

        <section className={step === 1 ? "space-y-4" : "hidden"}>
          <SelectField name="costCenterId" label="Grupo de trabajo" defaultValue={initialValues.costCenterId} options={costCenterOptions} />
          <SelectField name="clientId" label="Cliente" defaultValue={initialValues.clientId} options={clientOptions} />
          <SelectField name="droneId" label="Dron" defaultValue={initialValues.droneId} options={droneOptions} />
          <SelectField name="operatorId" label="Operador" defaultValue={initialValues.operatorId} options={operatorOptions} />
        </section>

        <section className={step === 2 ? "space-y-4" : "hidden"}>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Notas operativas</span>
            <textarea
              name="notes"
              rows={6}
              defaultValue={initialValues.notes}
              placeholder="Contexto operativo antes de geometría y revisión normativa."
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Área de operación</p>
            <p className="mt-2 leading-6">La geometría editable se mostrará en el paso avanzado. Por ahora, dejá el contexto operativo y seguí con la asignación.</p>
          </div>
        </section>

        <section className={step === 3 ? "space-y-4" : "hidden"}>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Documentación requerida</p>
            <ul className="mt-3 space-y-2 text-slate-400">
              <li>• Seguro / documentación del dron</li>
              <li>• Credencial del operador</li>
              <li>• Evidencia cliente / respaldo técnico</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-sm text-amber-100">
            Antes de enviar el plan, asegurate de que la documentación mínima esté lista para revisión DGAC.
          </div>
        </section>

        <section className={step === 4 ? "space-y-4" : "hidden"}>
          <div className="grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedGeoJson((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            {showAdvancedGeoJson ? "Ocultar GeoJSON avanzado" : "Ver GeoJSON avanzado"}
          </button>

          {showAdvancedGeoJson ? (
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">GeoJSON avanzado</span>
              <textarea
                rows={10}
                value={payload}
                onChange={(event) => setPayload(event.target.value)}
                placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]}"}'
                className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 font-mono text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
              />
              <p className="text-xs leading-5 text-slate-500">Vista avanzada para revisar o pegar GeoJSON manualmente. El flujo principal no depende de este campo.</p>
            </label>
          ) : null}

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Resumen actual</p>
            <p className="mt-2 leading-6 text-slate-400">{geometrySummary ?? "Sin geometría adjunta todavía"}</p>
          </div>
        </section>

        <section className={step === 5 ? "space-y-4" : "hidden"}>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Revisión final</p>
            <ul className="mt-3 space-y-2 text-slate-400">
              <li>• Código, título y fecha listos</li>
              <li>• Centro de costo, cliente, dron y operador asignados</li>
              <li>• Checklist DGAC / cliente revisado</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label={submitLabel} />
            <Link
              href="/flight-plans"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Cancelar
            </Link>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={!canGoBack}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Volver
          </button>

          {canGoNext ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
            >
              Continuar
            </button>
          ) : null}
        </div>
      </form>
    </DetailPanel>
  );
}

"use client";

import { useState } from "react";
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
  { label: "Datos generales", description: "Identificación, fecha y contexto operativo." },
  { label: "Asignación", description: "Centro de costo, cliente, dron y operador." },
  { label: "Revisión y mapa", description: "Crear el plan y pasar directo al editor satelital." },
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
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">{label}</span>
      <select
        name={name}
        required
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
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
          ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : active
            ? "border-cyan-500/30 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-200"
            : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-500"
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
  const payload = initialValues.geometryPayload;
  const canGoNext = step < STEPS.length - 1;
  const canGoBack = step > 0;

  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((item, index) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-4 transition ${
                step === index
                  ? "border-cyan-500/30 bg-cyan-50/80 dark:bg-cyan-500/[0.05]"
                  : step > index
                    ? "border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-500/[0.04]"
                    : "border-slate-200 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/45"
              }`}
            >
              <div className="flex items-start gap-3">
                <StepBadge current={step} step={index} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-500">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <input type="hidden" name="geometryPayload" value={payload} />

        <section className={step === 0 ? "space-y-4" : "hidden"}>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Código interno</span>
            <input
              type="text"
              name="code"
              required
              defaultValue={initialValues.code}
              placeholder="FP-2026-001"
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Título</span>
            <input
              type="text"
              name="title"
              required
              defaultValue={initialValues.title}
              placeholder="Inspección corredor norte"
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Fecha de operación</span>
            <input
              type="date"
              name="operationDate"
              required
              defaultValue={initialValues.operationDate}
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Notas operativas</span>
            <textarea
              name="notes"
              rows={4}
              defaultValue={initialValues.notes}
              placeholder="Contexto de la operación, objetivos, condiciones del terreno."
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:placeholder:text-slate-500"
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
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-5 text-sm leading-6 text-cyan-900 dark:bg-cyan-500/[0.05] dark:text-cyan-100">
            <p className="font-semibold">El área de operación se define en mapa</p>
            <p className="mt-2 text-cyan-800/80 dark:text-cyan-200/80">
              Creá primero el plan operativo. Luego abrí el editor satelital para dibujar, importar o ajustar la zona de vuelo con herramientas visuales.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/45 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-white">Revisión final</p>
            <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
              <li>• Código, título, fecha y notas listos</li>
              <li>• Centro de costo, cliente, dron y operador asignados</li>
              <li>• Próximo paso: dibujar área de operación en el mapa</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton label={submitLabel} />
            <Link
              href="/flight-plans"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancelar
            </Link>
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            disabled={!canGoBack}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            Volver
          </button>

          {canGoNext ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 px-4 py-2.5 text-sm font-medium text-cyan-700 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
            >
              Continuar
            </button>
          ) : null}
        </div>
      </form>
    </DetailPanel>
  );
}

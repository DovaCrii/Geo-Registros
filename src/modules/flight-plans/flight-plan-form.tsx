import Link from "next/link";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PrimaryButton } from "@/components/ui/primary-button";

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
          Select {label.toLowerCase()}
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

export function FlightPlanForm({
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
  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Internal code</span>
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
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Title</span>
          <input
            type="text"
            name="title"
            required
            defaultValue={initialValues.title}
            placeholder="Northern corridor inspection"
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Operation date</span>
          <input
            type="date"
            name="operationDate"
            required
            defaultValue={initialValues.operationDate}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <SelectField name="costCenterId" label="Cost center" defaultValue={initialValues.costCenterId} options={costCenterOptions} />
        <SelectField name="clientId" label="Client" defaultValue={initialValues.clientId} options={clientOptions} />
        <SelectField name="droneId" label="Drone" defaultValue={initialValues.droneId} options={droneOptions} />
        <SelectField name="operatorId" label="Operator" defaultValue={initialValues.operatorId} options={operatorOptions} />

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Notes</span>
          <textarea
            name="notes"
            rows={5}
            defaultValue={initialValues.notes}
            placeholder="Operational context before geometry and permit workflow."
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Geometry payload (GeoJSON)</span>
          <textarea
            name="geometryPayload"
            rows={10}
            defaultValue={initialValues.geometryPayload}
            placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]},"properties":{}}'
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 font-mono text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          />
          <p className="text-xs leading-5 text-slate-500">
            Optional in this slice. Save only canonical GeoJSON-shaped payloads. Interactive map editing is deferred.
          </p>
          {geometrySummary ? <p className="text-xs text-cyan-300">Current geometry: {geometrySummary}</p> : null}
        </label>

        <div className="flex items-center gap-3 pt-2">
          <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
          <Link
            href="/flight-plans"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </DetailPanel>
  );
}

import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PrimaryButton } from "@/components/ui/primary-button";

type CostCenterOption = {
  id: string;
  code: string;
  name: string;
};

type DroneFormValues = {
  code: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  notes: string;
  costCenterId: string;
  status: RecordStatus;
};

const statusOptions = [RecordStatus.ACTIVE, RecordStatus.INACTIVE];

export function DroneForm({
  title,
  description,
  action,
  submitLabel,
  initialValues,
  costCenterOptions,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValues: DroneFormValues;
  costCenterOptions: CostCenterOption[];
}) {
  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Code</span>
          <input
            type="text"
            name="code"
            defaultValue={initialValues.code}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="RP-001"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Serial number</span>
          <input
            type="text"
            name="serialNumber"
            required
            defaultValue={initialValues.serialNumber}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="SN-000123"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Manufacturer</span>
          <input
            type="text"
            name="manufacturer"
            defaultValue={initialValues.manufacturer}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="DJI"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Model</span>
          <input
            type="text"
            name="model"
            required
            defaultValue={initialValues.model}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="Matrice 350 RTK"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Cost center</span>
          <select
            name="costCenterId"
            defaultValue={initialValues.costCenterId}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Unassigned</option>
            {costCenterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.code} — {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Status</span>
          <select
            name="status"
            defaultValue={initialValues.status}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Notes</span>
          <textarea
            name="notes"
            rows={5}
            defaultValue={initialValues.notes}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            placeholder="Lifecycle, payload, maintenance, or operational notes."
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
          <Link
            href="/drones"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </DetailPanel>
  );
}

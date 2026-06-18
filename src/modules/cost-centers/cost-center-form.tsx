import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { SubmitButton } from "@/components/ui/submit-button";

type CostCenterFormValues = {
  code: string;
  name: string;
  description: string;
  status: RecordStatus;
};

const statusOptions = [RecordStatus.ACTIVE, RecordStatus.INACTIVE];

export function CostCenterForm({
  title,
  description,
  action,
  submitLabel,
  initialValues,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialValues: CostCenterFormValues;
}) {
  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Código</span>
          <input
            type="text"
            name="code"
            required
            defaultValue={initialValues.code}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
            placeholder="CC-001"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Nombre</span>
          <input
            type="text"
            name="name"
            required
            defaultValue={initialValues.name}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
            placeholder="Operaciones de prospección norte"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Estado</span>
          <select
            name="status"
            defaultValue={initialValues.status}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Descripción</span>
          <textarea
            name="description"
            rows={5}
            defaultValue={initialValues.description}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
            placeholder="Notas operativas, alcance o referencias internas."
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label={submitLabel} />
          <Link
            href="/cost-centers"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </DetailPanel>
  );
}

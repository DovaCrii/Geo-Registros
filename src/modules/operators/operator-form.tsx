import Link from "next/link";
import { RecordStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { SubmitButton } from "@/components/ui/submit-button";

type CostCenterOption = {
  id: string;
  code: string;
  name: string;
};

type OperatorFormValues = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  notes: string;
  costCenterId: string;
  status: RecordStatus;
};

const statusOptions = [RecordStatus.ACTIVE, RecordStatus.INACTIVE];

export function OperatorForm({
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
  initialValues: OperatorFormValues;
  costCenterOptions: CostCenterOption[];
}) {
  return (
    <DetailPanel title={title} description={description}>
      <form action={action} className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Código</span>
          <input type="text" name="code" defaultValue={initialValues.code} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="OP-001" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Nombre completo</span>
          <input type="text" name="fullName" required defaultValue={initialValues.fullName} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="Camila Rojas" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Correo</span>
          <input type="email" name="email" defaultValue={initialValues.email} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="operator@example.com" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Teléfono</span>
          <input type="text" name="phone" defaultValue={initialValues.phone} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="+56 9 1234 5678" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Licencia</span>
          <input type="text" name="licenseNumber" defaultValue={initialValues.licenseNumber} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="DGAC-RPA-0001" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Vencimiento licencia</span>
          <input type="date" name="licenseExpiry" defaultValue={initialValues.licenseExpiry} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Grupo de trabajo</span>
          <select name="costCenterId" defaultValue={initialValues.costCenterId} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20">
            <option value="">Sin asignar</option>
            {costCenterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.code} — {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Estado</span>
          <select name="status" defaultValue={initialValues.status} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20">
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Notas</span>
          <textarea name="notes" rows={5} defaultValue={initialValues.notes} className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20" placeholder="Notas de certificación, readiness o cumplimiento." />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton label={submitLabel} />
          <Link href="/operators" className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </DetailPanel>
  );
}

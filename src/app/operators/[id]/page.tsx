import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { OperatorForm } from "@/modules/operators/operator-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { deleteOperator } from "@/server/operators/actions";
import { updateOperator } from "@/server/operators/actions";
import { getOperatorById } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function OperatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/operators/${id}`);

  try {
    const [record, costCenterOptions] = await Promise.all([getOperatorById(id), listActiveCostCenters().catch(() => [])]);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Operador no encontrado" description="El operador solicitado no existe o ya no está disponible.">
            <p className="text-sm text-slate-400">Volvé al listado y seleccioná un operador válido.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Operadores RPAS", href: "/operators" },
              { label: record.fullName },
            ]}
          />

          <PageHeader
            eyebrow="Bloque 2 / Datos maestros"
            title={record.fullName}
            description="Editá los datos del operador RPA."
            actions={<StatusChip label={record.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(record.status)} />}
          />

            <OperatorForm
              title="Editar operador"
              description="Actualizá identidad, contacto, licencia, grupo de trabajo opcional y estado."
              action={updateOperator.bind(null, record.id)}
              submitLabel="Guardar cambios"
            costCenterOptions={
              record.costCenter
                ? costCenterOptions.some((item) => item.id === record.costCenter!.id)
                  ? costCenterOptions
                  : [{ id: record.costCenter.id, code: record.costCenter.code ?? "", name: record.costCenter.name }, ...costCenterOptions]
                : costCenterOptions
            }
              initialValues={{
                code: record.code ?? "",
                fullName: record.fullName,
                email: record.email ?? "",
                phone: record.phone ?? "",
                licenseNumber: record.licenseNumber ?? "",
                licenseExpiry: record.licenseExpiry ? record.licenseExpiry.toISOString().slice(0, 10) : "",
                notes: record.notes ?? "",
                costCenterId: record.costCenterId ?? "",
                status: record.status,
              }}
            />

          <DetailPanel title="Zona de riesgo" description="La eliminación lógica oculta este operador sin perder su historial.">
            <form action={deleteOperator.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                Esta acción lo saca de listados, selectores y conteos del panel. Los planes de vuelo vinculados se conservan.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Eliminar operador
              </button>
            </form>
          </DetailPanel>
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
        <DetailPanel title="Operador no disponible" description="No se pudieron cargar los datos. Verificá la conexión a la base de datos.">
          <p className="text-sm text-slate-400">Recargá la página e intentá de nuevo.</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

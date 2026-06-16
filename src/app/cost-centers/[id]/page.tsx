import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { CostCenterForm } from "@/modules/cost-centers/cost-center-form";
import { deleteCostCenter } from "@/server/cost-centers/actions";
import { updateCostCenter } from "@/server/cost-centers/actions";
import { getCostCenterById } from "@/server/cost-centers/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function CostCenterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/cost-centers/${id}`);

  try {
    const record = await getCostCenterById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Grupo no encontrado" description="El grupo de trabajo solicitado no existe o ya no está disponible.">
            <p className="text-sm text-slate-400">Volvé al listado y seleccioná un grupo válido.</p>
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
              { label: "Grupos de trabajo", href: "/cost-centers" },
              { label: record.name },
            ]}
          />

          <PageHeader
            eyebrow="Bloque 2 / Datos maestros"
            title={record.name}
            description="Editá los datos del grupo de trabajo."
            actions={<StatusChip label={record.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(record.status)} />}
          />

          <CostCenterForm
            title="Editar grupo de trabajo"
            description="Actualizá código, nombre, estado o descripción interna."
            action={updateCostCenter.bind(null, record.id)}
            submitLabel="Guardar cambios"
            initialValues={{
              code: record.code,
              name: record.name,
              description: record.description ?? "",
              status: record.status,
            }}
          />

          <DetailPanel title="Zona de riesgo" description="La eliminación lógica oculta este grupo sin perder su historial.">
            <form action={deleteCostCenter.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                Esta acción lo saca de listados, selectores y conteos del panel. Los registros vinculados conservan su referencia histórica.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Eliminar grupo de trabajo
              </button>
            </form>
          </DetailPanel>
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
        <DetailPanel title="Grupo no disponible" description="No se pudieron cargar los datos. Verificá la conexión a la base de datos.">
          <p className="text-sm text-slate-400">Recargá la página e intentá de nuevo.</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { DroneForm } from "@/modules/drones/drone-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { deleteDrone } from "@/server/drones/actions";
import { updateDrone } from "@/server/drones/actions";
import { getDroneById } from "@/server/drones/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function DroneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/drones/${id}`);

  try {
    const [record, costCenterOptions] = await Promise.all([
      getDroneById(id),
      listActiveCostCenters().catch(() => []),
    ]);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Dron no encontrado" description="El dron solicitado no existe o ya no está disponible.">
            <p className="text-sm text-slate-500 dark:text-slate-400">Volvé al listado y seleccioná un dron válido.</p>
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
              { label: "Flota RPAS", href: "/drones" },
              { label: record.model },
            ]}
          />

          <PageHeader
            eyebrow="Bloque 2 / Datos maestros"
            title={record.model}
            description="Editá los datos del dron registrado."
            actions={<StatusChip label={record.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(record.status)} />}
          />

          <DetailPanel title="Planes de vuelo vinculados" description="Planes donde este dron está asignado.">
            <div className="space-y-2">
              {record.flightPlans.length > 0 ? record.flightPlans.map((flightPlan) => (
                <a key={flightPlan.id} href={`/flight-plans/${flightPlan.id}`} className="block rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 px-4 py-3 transition hover:bg-slate-50 dark:hover:border-accent/40 dark:hover:bg-cyan-500/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{flightPlan.code} · {flightPlan.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{flightPlan.operationDate.toISOString().slice(0, 10)}</p>
                    </div>
                    <span className="text-xs text-slate-400">{flightPlan.permissionStatus}</span>
                  </div>
                </a>
              )) : <p className="text-sm text-slate-500">Este dron todavía no tiene planes de vuelo vinculados.</p>}
            </div>
          </DetailPanel>

          <DroneForm
              title="Editar dron"
              description="Actualizá identidad, fabricante, grupo de trabajo opcional, estado y notas."
              action={updateDrone.bind(null, record.id)}
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
                serialNumber: record.serialNumber,
                manufacturer: record.manufacturer ?? "",
                model: record.model,
                insuranceExpiry: record.insuranceExpiry ? record.insuranceExpiry.toISOString().slice(0, 10) : "",
                notes: record.notes ?? "",
                costCenterId: record.costCenterId ?? "",
                status: record.status,
              }}
            />

          <DetailPanel title="Zona de riesgo" description="La eliminación lógica oculta este dron sin perder su historial.">
            <form action={deleteDrone.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Esta acción lo saca de listados, selectores y conteos del panel. Los planes de vuelo vinculados se conservan.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-status-danger/30 dark:border-rose-500/30 bg-status-danger/10 dark:bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-status-danger dark:text-rose-200 transition hover:border-status-danger/50 dark:hover:border-rose-400/50 hover:bg-status-danger/15 dark:hover:bg-rose-400/20"
              >
                Eliminar dron
              </button>
            </form>
          </DetailPanel>
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
        <DetailPanel title="Dron no disponible" description="No se pudieron cargar los datos. Verificá la conexión a la base de datos.">
          <p className="text-sm text-slate-500 dark:text-slate-400">Recargá la página e intentá de nuevo.</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

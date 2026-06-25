import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { CostCenterForm } from "@/modules/cost-centers/cost-center-form";
import { deleteCostCenter, updateCostCenter } from "@/server/cost-centers/actions";
import { getCostCenterById } from "@/server/cost-centers/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function CostCenterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePageAuth(`/cost-centers/${id}`);

  try {
    const record = await getCostCenterById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel
            title="Grupo no encontrado"
            description="El grupo de trabajo solicitado no existe o ya no está disponible."
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Volvé al listado y seleccioná un grupo válido.
            </p>
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
            actions={
              <StatusChip
                label={record.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"}
                tone={toneFromStatus(record.status)}
              />
            }
          />

          <DetailPanel
            title="Relaciones vinculadas"
            description="Drones, operadores y planes de vuelo que dependen de este grupo."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Drones
                </p>
                <div className="mt-3 space-y-2">
                  {record.drones.length > 0 ? (
                    record.drones.map((drone) => (
                      <a
                        key={drone.id}
                        href={`/drones/${drone.id}`}
                        className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white dark:hover:border-accent/40 dark:hover:bg-cyan-500/5"
                      >
                        {drone.code ?? "—"} · {drone.model}
                        <span className="block text-xs text-slate-600 dark:text-slate-500">
                          {drone.serialNumber}
                        </span>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sin drones vinculados.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                  Operadores
                </p>
                <div className="mt-3 space-y-2">
                  {record.operators.length > 0 ? (
                    record.operators.map((operator) => (
                      <a
                        key={operator.id}
                        href={`/operators/${operator.id}`}
                        className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white dark:hover:border-accent/40 dark:hover:bg-cyan-500/5"
                      >
                        {operator.code ?? "—"} · {operator.fullName}
                        <span className="block text-xs text-slate-600 dark:text-slate-500">
                          {operator.licenseNumber ?? "Licencia pendiente"}
                        </span>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sin operadores vinculados.</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                  Planes de vuelo
                </p>
                <div className="mt-3 space-y-2">
                  {record.flightPlans.length > 0 ? (
                    record.flightPlans.map((flightPlan) => (
                      <a
                        key={flightPlan.id}
                        href={`/flight-plans/${flightPlan.id}`}
                        className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-white dark:hover:border-accent/40 dark:hover:bg-cyan-500/5"
                      >
                        {flightPlan.code} · {flightPlan.title}
                        <span className="block text-xs text-slate-600 dark:text-slate-500">
                          {flightPlan.operationDate.toISOString().slice(0, 10)}
                        </span>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Sin planes de vuelo vinculados.</p>
                  )}
                </div>
              </div>
            </div>
          </DetailPanel>

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

          <DetailPanel
            title="Zona de riesgo"
            description="La eliminación lógica oculta este grupo sin perder su historial."
          >
            <form action={deleteCostCenter.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                Esta acción lo saca de listados, selectores y conteos del panel. Los registros
                vinculados conservan su referencia histórica.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-status-danger/30 dark:border-rose-500/30 bg-status-danger/10 dark:bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-status-danger dark:text-rose-200 transition hover:border-status-danger/50 dark:hover:border-rose-400/50 hover:bg-status-danger/15 dark:hover:bg-rose-400/20"
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
        <DetailPanel
          title="Grupo no disponible"
          description="No se pudieron cargar los datos. Verificá la conexión a la base de datos."
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recargá la página e intentá de nuevo.
          </p>
        </DetailPanel>
      </PageShell>
    );
  }
}

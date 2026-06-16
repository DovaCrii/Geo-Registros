import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { ClientForm } from "@/modules/clients/client-form";
import { deleteClient } from "@/server/clients/actions";
import { updateClient } from "@/server/clients/actions";
import { getClientById } from "@/server/clients/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: RecordStatus) {
  return status === RecordStatus.ACTIVE ? "success" : "neutral";
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/clients/${id}`);

  try {
    const record = await getClientById(id);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Cliente no encontrado" description="El cliente solicitado no existe o ya no está disponible.">
            <p className="text-sm text-slate-400">Volvé al listado y seleccioná un cliente válido.</p>
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
              { label: "Clientes", href: "/clients" },
              { label: record.name },
            ]}
          />

          <PageHeader
            eyebrow="Bloque 2 / Datos maestros"
            title={record.name}
            description="Editá los datos del cliente."
            actions={<StatusChip label={record.status === RecordStatus.ACTIVE ? "Activo" : "Inactivo"} tone={toneFromStatus(record.status)} />}
          />

          <DetailPanel title="Planes de vuelo vinculados" description="Planes operativos donde este cliente ya está asociado.">
            <div className="space-y-2">
              {record.flightPlans.length > 0 ? record.flightPlans.map((flightPlan) => (
                <a key={flightPlan.id} href={`/flight-plans/${flightPlan.id}`} className="block rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3 transition hover:border-cyan-400/40 hover:bg-cyan-500/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{flightPlan.code} · {flightPlan.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{flightPlan.operationDate.toISOString().slice(0, 10)}</p>
                    </div>
                    <span className="text-xs text-slate-500">{flightPlan.permissionStatus}</span>
                  </div>
                </a>
              )) : <p className="text-sm text-slate-500">Este cliente todavía no tiene planes de vuelo vinculados.</p>}
            </div>
          </DetailPanel>

          <ClientForm
            title="Editar cliente"
            description="Actualizá identidad, contacto principal, estado y notas internas."
            action={updateClient.bind(null, record.id)}
            submitLabel="Guardar cambios"
            initialValues={{
              code: record.code ?? "",
              name: record.name,
              contactName: record.contactName ?? "",
              contactEmail: record.contactEmail ?? "",
              notes: record.notes ?? "",
              status: record.status,
            }}
          />

          <DetailPanel title="Zona de riesgo" description="La eliminación lógica oculta este cliente sin perder su historial.">
            <form action={deleteClient.bind(null, record.id)} className="space-y-3">
              <p className="text-sm leading-6 text-slate-400">
                Esta acción lo saca de listados, selectores y conteos del panel. Los planes de vuelo vinculados se conservan.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
              >
                Eliminar cliente
              </button>
            </form>
          </DetailPanel>
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
        <DetailPanel title="Cliente no disponible" description="No se pudieron cargar los datos. Verificá la conexión a la base de datos.">
          <p className="text-sm text-slate-400">Recargá la página e intentá de nuevo.</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

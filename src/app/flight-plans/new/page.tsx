import { DetailPanel } from "@/components/ui/detail-panel";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { FlightPlanForm } from "@/modules/flight-plans/flight-plan-form";
import { listActiveClients } from "@/server/clients/queries";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { listActiveDrones } from "@/server/drones/queries";
import { createFlightPlan } from "@/server/flight-plans/actions";
import { listActiveOperators } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

export default async function NewFlightPlanPage() {
  await requirePageAuth("/flight-plans/new");

  const [costCenters, clients, drones, operators] = await Promise.all([
    listActiveCostCenters().catch(() => []),
    listActiveClients().catch(() => []),
    listActiveDrones().catch(() => []),
    listActiveOperators().catch(() => []),
  ]);

  const missingDependencies = [
    { label: "Grupos de trabajo", count: costCenters.length, href: "/cost-centers/new" },
    { label: "Clientes", count: clients.length, href: "/clients/new" },
    { label: "Drones", count: drones.length, href: "/drones/new" },
    { label: "Operadores", count: operators.length, href: "/operators/new" },
  ].filter((item) => item.count === 0);

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Planes de vuelo", href: "/flight-plans" }, { label: "Crear plan de vuelo" }]} />

        <PageHeader
          eyebrow="Bloque 3 / Planes de vuelo"
          title="Crear plan de vuelo"
          description="Registrá el plan operativo antes de avanzar a geometría, permisos y documentación."
        />

        {missingDependencies.length > 0 ? (
          <DetailPanel title="Datos maestros requeridos" description="Antes de crear el plan necesitás completar los registros base del flujo.">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Faltan datos en: {missingDependencies.map((item) => item.label).join(", ")}.
                Si la base de datos está offline, los selectores también quedarán indisponibles hasta recuperar conectividad.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {missingDependencies.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 px-4 py-2.5 text-sm font-medium text-cyan-700 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
                  >
                    Crear {item.label.toLowerCase()}
                  </a>
                ))}
              </div>
            </div>
          </DetailPanel>
        ) : null}

        <FlightPlanForm
          title="Formulario de plan de vuelo"
          description="Este flujo prioriza la identidad operativa y la asignación. La geometría se trabaja después."
          action={createFlightPlan}
          submitLabel="Crear plan de vuelo"
          initialValues={{
            code: "",
            title: "",
            operationDate: "",
            notes: "",
            geometryPayload: "",
            costCenterId: "",
            clientId: "",
            droneId: "",
            operatorId: "",
          }}
          costCenterOptions={costCenters.map((item) => ({ id: item.id, label: `${item.code} · ${item.name}` }))}
          clientOptions={clients.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name }))}
          droneOptions={drones.map((item) => ({ id: item.id, label: `${item.model} · ${item.serialNumber}` }))}
          operatorOptions={operators.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.fullName}` : item.fullName }))}
          geometrySummary="Sin geometría adjunta todavía"
        />
      </div>
    </PageShell>
  );
}

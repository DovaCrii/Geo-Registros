import { DetailPanel } from "@/components/ui/detail-panel";
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

  const hasDependencies = costCenters.length > 0 && clients.length > 0 && drones.length > 0 && operators.length > 0;

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Bloque 3 / Planes de vuelo"
          title="Crear plan de vuelo"
          description="Registrá el plan operativo antes de avanzar a geometría, permisos y documentación."
        />

        {!hasDependencies ? (
          <DetailPanel title="Datos maestros requeridos" description="Necesitás al menos un centro de costo, cliente, dron y operador activo antes de crear el primer plan de vuelo.">
            <p className="text-sm text-slate-300">Si la base de datos está offline, estos selectores también quedarán indisponibles hasta recuperar conectividad.</p>
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

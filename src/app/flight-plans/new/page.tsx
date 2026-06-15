import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { FlightPlanForm } from "@/modules/flight-plans/flight-plan-form";
import { listActiveClients } from "@/server/clients/queries";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { listActiveDrones } from "@/server/drones/queries";
import { createFlightPlan } from "@/server/flight-plans/actions";
import { listActiveOperators } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

export default async function NewFlightPlanPage() {
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
          eyebrow="Block 3 / Flight plans"
          title="Create flight plan"
          description="Register the operational record before introducing geometry, permits, or document-package behavior."
        />

        {!hasDependencies ? (
          <DetailPanel title="Master data required" description="At least one active cost center, client, drone, and operator is required before creating the first flight plan.">
            <p className="text-sm text-slate-300">If the database is offline, these selectors will also remain unavailable until connectivity is restored.</p>
          </DetailPanel>
        ) : null}

        <FlightPlanForm
          title="Flight plan form"
          description="Keep this first slice focused on operational identity and assignment only. Geometry comes next."
          action={createFlightPlan}
          submitLabel="Create flight plan"
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
          geometrySummary="No geometry attached yet"
        />
      </div>
    </PageShell>
  );
}

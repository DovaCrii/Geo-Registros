import Link from "next/link";
import { FlightPlanStatus } from "@prisma/client";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { FlightPlanForm } from "@/modules/flight-plans/flight-plan-form";
import { listActiveClients } from "@/server/clients/queries";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { listActiveDrones } from "@/server/drones/queries";
import { updateFlightPlan } from "@/server/flight-plans/actions";
import { getFlightPlanById } from "@/server/flight-plans/queries";
import { listActiveOperators } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

function toneFromStatus(status: FlightPlanStatus) {
  switch (status) {
    case FlightPlanStatus.READY_FOR_GEOMETRY:
      return "info";
    case FlightPlanStatus.ON_HOLD:
      return "warning";
    default:
      return "neutral";
  }
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function FlightPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const [record, costCenters, clients, drones, operators] = await Promise.all([
      getFlightPlanById(id),
      listActiveCostCenters().catch(() => []),
      listActiveClients().catch(() => []),
      listActiveDrones().catch(() => []),
      listActiveOperators().catch(() => []),
    ]);

    if (!record) {
      return (
        <PageShell>
          <DetailPanel title="Flight plan not found" description="The requested operational record does not exist or is no longer available.">
            <p className="text-sm text-slate-400">Return to the flight-plan list and select a valid record.</p>
          </DetailPanel>
        </PageShell>
      );
    }

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Block 3 / Flight plans"
            title={record.title}
            description="Edit the operational record before geometry, permits, and documentation layers are attached."
            actions={
              <>
                <Link
                  href={`/flight-plans/${record.id}/geometry`}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
                >
                  Open geometry page
                </Link>
                <StatusChip label={record.status} tone={toneFromStatus(record.status)} />
              </>
            }
          />

          <FlightPlanForm
            title="Edit flight plan"
            description="Adjust the operational identity, date, assignment links, and canonical payload if needed. For assisted editing, use the dedicated geometry page."
            action={updateFlightPlan.bind(null, record.id)}
            submitLabel="Save changes"
            initialValues={{
              code: record.code,
              title: record.title,
              operationDate: formatDateInput(record.operationDate),
              status: record.status,
              notes: record.notes ?? "",
              geometryPayload: record.geometryJson ? JSON.stringify(record.geometryJson, null, 2) : "",
              costCenterId: record.costCenterId,
              clientId: record.clientId,
              droneId: record.droneId,
              operatorId: record.operatorId,
            }}
            costCenterOptions={costCenters.map((item) => ({ id: item.id, label: `${item.code} · ${item.name}` }))}
            clientOptions={clients.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name }))}
            droneOptions={drones.map((item) => ({ id: item.id, label: `${item.model} · ${item.serialNumber}` }))}
            operatorOptions={operators.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.fullName}` : item.fullName }))}
            geometrySummary={record.geometryType ?? "No geometry attached yet"}
          />
        </div>
      </PageShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";

    return (
      <PageShell>
        <DetailPanel title="Flight plan unavailable" description="The page is wired to the real Prisma query path, but the database is not ready or reachable.">
          <p className="text-sm text-slate-300">{message}</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

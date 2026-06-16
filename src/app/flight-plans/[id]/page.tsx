import Link from "next/link";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { FlightPlanForm } from "@/modules/flight-plans/flight-plan-form";
import { PermissionActions } from "@/modules/permissions/permission-actions";
import { PermissionStatusBadge } from "@/modules/permissions/permission-status-badge";
import { PermissionTimeline } from "@/modules/permissions/permission-timeline";
import { DocumentUpload } from "@/modules/permissions/document-upload";
import { listActiveClients } from "@/server/clients/queries";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { listActiveDrones } from "@/server/drones/queries";
import { deleteFlightPlan, updateFlightPlan } from "@/server/flight-plans/actions";
import { listActiveOperators } from "@/server/operators/queries";
import { getFlightPlanWithPermissions } from "@/server/permissions/queries";
import { getWeatherForecast } from "@/server/weather/service";
import { WeatherCard } from "@/modules/weather/weather-card";

export const dynamic = "force-dynamic";

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function withCurrentOption<T extends { id: string; label: string }>(
  options: T[],
  current?: { id: string; label: string },
) {
  if (!current) return options;
  if (options.some((item) => item.id === current.id)) return options;
  return [current, ...options];
}

export default async function FlightPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePageAuth(`/flight-plans/${id}`);

  try {
    const [record, costCenters, clients, drones, operators] = await Promise.all([
      getFlightPlanWithPermissions(id),
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

    const weatherData = record.geometryJson
      ? await getWeatherForecast(record.geometryJson, record.operationDate).catch(() => null)
      : null;

    const clientOptionsWithCurrent = withCurrentOption(
      clients.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name })),
      record.client ? { id: record.client.id, label: record.client.name } : undefined,
    );

    const droneOptionsWithCurrent = withCurrentOption(
      drones.map((item) => ({ id: item.id, label: `${item.model} · ${item.serialNumber}` })),
      record.drone ? { id: record.drone.id, label: `${record.drone.model} · ${record.drone.serialNumber}` } : undefined,
    );

    const operatorOptionsWithCurrent = withCurrentOption(
      operators.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.fullName}` : item.fullName })),
      record.operator ? {
        id: record.operator.id,
        label: record.operator.fullName,
      } : undefined,
    );

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Permission workflow"
            title={record.title}
            description="Manage the operational record, permission state, documents, and audit trail."
            actions={
              <>
                <a
                  href={`/api/reports/flight-plan/${record.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/20"
                  download
                >
                  <span>⬇</span>
                  Reporte PDF
                </a>
                <Link
                  href={`/flight-plans/${record.id}/geometry`}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
                >
                  Open geometry page
                </Link>
                <PermissionStatusBadge status={record.permissionStatus} />
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            {/* Left column: form + permission controls */}
            <div className="space-y-6">
              <FlightPlanForm
                title="Flight plan details"
                description="Adjust the operational identity, date, assignment links, and canonical payload."
                action={updateFlightPlan.bind(null, record.id)}
                submitLabel="Save changes"
                initialValues={{
                  code: record.code,
                  title: record.title,
                  operationDate: formatDateInput(record.operationDate),
                  notes: record.notes ?? "",
                  geometryPayload: record.geometryJson ? JSON.stringify(record.geometryJson, null, 2) : "",
                  costCenterId: record.costCenterId,
                  clientId: record.clientId,
                  droneId: record.droneId,
                  operatorId: record.operatorId,
                }}
                costCenterOptions={costCenters.map((item) => ({ id: item.id, label: `${item.code} · ${item.name}` }))}
                clientOptions={clientOptionsWithCurrent}
                droneOptions={droneOptionsWithCurrent}
                operatorOptions={operatorOptionsWithCurrent}
                geometrySummary={record.geometryType ?? "No geometry attached yet"}
              />

              <DetailPanel title="Permission workflow" description="Manage the permission state and transitions for this flight plan.">
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Current status</p>
                    <PermissionStatusBadge status={record.permissionStatus} />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Available transitions</p>
                    <PermissionActions flightPlanId={record.id} currentStatus={record.permissionStatus} />
                  </div>
                </div>
              </DetailPanel>

              <DetailPanel title="Documents" description="Attach and manage operational documents for this flight plan.">
                <DocumentUpload flightPlanId={record.id} documents={record.documents} />
              </DetailPanel>

              <DetailPanel
                title="Danger zone"
                description="Soft delete hides this flight plan from the app while preserving its historical record."
              >
                <form action={deleteFlightPlan.bind(null, record.id)} className="space-y-3">
                  <p className="text-sm leading-6 text-slate-400">
                    This action removes the record from active views, list pages, dashboard counts, and geometry access.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
                  >
                    Delete flight plan
                  </button>
                </form>
              </DetailPanel>
            </div>

            {/* Right column: timeline + weather */}
            <div className="space-y-6">
              <DetailPanel title="Event timeline" description="Audit trail of all permission-related events.">
                <PermissionTimeline events={record.permissionEvents} />
              </DetailPanel>

              <WeatherCard data={weatherData} />
            </div>
          </div>
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

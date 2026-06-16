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
import { FlightPlanChecklist } from "@/modules/dgac/flight-plan-checklist";
import {
  DGAC_CHECKLIST_ITEMS,
  deriveChecklistState,
  evaluateChecklistSubmission,
  normalizeChecklist,
} from "@/modules/dgac/checklist-items";
import { listActiveClients } from "@/server/clients/queries";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { listActiveDrones } from "@/server/drones/queries";
import { deleteFlightPlan, updateFlightPlan } from "@/server/flight-plans/actions";
import { listActiveOperators } from "@/server/operators/queries";
import { getFlightPlanById } from "@/server/flight-plans/queries";
import { getPermissionDocuments, getPermissionHistory } from "@/server/permissions/queries";
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

function labelFromList(
  items: Array<Record<string, unknown> & { id: string }>,
  id: string,
  fallback: string,
) {
  const found = items.find((item) => item.id === id);
  if (!found) return fallback;
  if (typeof found.fullName === "string") return found.fullName;
  if (typeof found.model === "string" && typeof found.serialNumber === "string") {
    return `${found.model} · ${found.serialNumber}`;
  }
  if (typeof found.code === "string" && found.code) return found.code;
  return fallback;
}

export default async function FlightPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
    await requirePageAuth(`/flight-plans/${id}`);

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

    const weatherData = record.geometryJson
      ? await getWeatherForecast(record.geometryJson, record.operationDate).catch(() => null)
      : null;

    const [permissionEvents, documents] = await Promise.all([
      getPermissionHistory(id),
      getPermissionDocuments(id),
    ]);

    const clientOptionsWithCurrent = withCurrentOption(
      clients.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.name}` : item.name })),
      { id: record.clientId, label: labelFromList(clients, record.clientId, record.clientId) },
    );

    const droneOptionsWithCurrent = withCurrentOption(
      drones.map((item) => ({ id: item.id, label: `${item.model} · ${item.serialNumber}` })),
      { id: record.droneId, label: labelFromList(drones, record.droneId, record.droneId) },
    );

    const operatorOptionsWithCurrent = withCurrentOption(
      operators.map((item) => ({ id: item.id, label: item.code ? `${item.code} · ${item.fullName}` : item.fullName })),
      { id: record.operatorId, label: labelFromList(operators, record.operatorId, record.operatorId) },
    );

    const currentDrone = drones.find((item) => item.id === record.droneId) ?? null;
    const currentOperator = operators.find((item) => item.id === record.operatorId) ?? null;
    const persistedChecklist = normalizeChecklist(record.dgacChecklist);
    const weatherReady = Boolean(weatherData && !("error" in weatherData)) || Boolean(persistedChecklist["weather-check"]);

    const suggestedChecklist = deriveChecklistState({
      record: {
        clientId: record.clientId,
        costCenterId: record.costCenterId,
        droneId: record.droneId,
        operatorId: record.operatorId,
        geometryJson: record.geometryJson,
        operationDate: record.operationDate,
      },
      documents,
      drone: currentDrone ? { insuranceExpiry: currentDrone.insuranceExpiry ?? null } : null,
      operator: currentOperator
        ? {
            licenseNumber: currentOperator.licenseNumber ?? null,
            licenseExpiry: currentOperator.licenseExpiry ?? null,
          }
        : null,
      weatherReady,
    });

    const checklistReview = evaluateChecklistSubmission(
      {
        record: {
          clientId: record.clientId,
          costCenterId: record.costCenterId,
          droneId: record.droneId,
          operatorId: record.operatorId,
          geometryJson: record.geometryJson,
          operationDate: record.operationDate,
        },
        documents,
        drone: currentDrone ? { insuranceExpiry: currentDrone.insuranceExpiry ?? null } : null,
        operator: currentOperator
          ? {
              licenseNumber: currentOperator.licenseNumber ?? null,
              licenseExpiry: currentOperator.licenseExpiry ?? null,
            }
          : null,
        weatherReady,
      },
      record.dgacChecklist,
    );

    const transitionBlocks = checklistReview.canSubmit
      ? undefined
      : {
          READY_FOR_SUBMISSION: `No se puede marcar como listo todavía. Faltan: ${checklistReview.missingItems.map((item) => item.label).join(", ")}`,
          SUBMITTED: `No se puede enviar todavía. Faltan: ${checklistReview.missingItems.map((item) => item.label).join(", ")}`,
        };

    return (
      <PageShell>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Flujo de permisos"
            title={record.title}
            description="Gestioná el registro operativo, el estado del permiso, la documentación y la auditoría."
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
                  Ir al área de operación
                </Link>
                <PermissionStatusBadge status={record.permissionStatus} />
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            {/* Left column: form + permission controls */}
            <div className="space-y-6">
              <FlightPlanForm
                title="Detalles del plan"
                description="Ajustá identidad operativa, fecha, asignaciones y payload canónico."
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
                geometrySummary={record.geometryType ?? "Sin geometría adjunta todavía"}
              />

              <DetailPanel title="Flujo de permisos" description="Gestioná el estado del permiso y sus transiciones.">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">Estado de preparación DGAC</p>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${checklistReview.canSubmit ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
                        {checklistReview.canSubmit ? "Listo para envío" : "Pendiente"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {DGAC_CHECKLIST_ITEMS.map((item) => {
                        const checked = Boolean(checklistReview.effectiveChecklist[item.id]);
                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl border px-3 py-2 text-xs leading-5 ${checked ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-50" : "border-slate-800 bg-slate-900/40 text-slate-300"}`}
                          >
                            <span className="font-medium">{checked ? "✓" : "○"} {item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!checklistReview.canSubmit ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                      <p className="text-sm font-medium text-amber-100">Checklist DGAC incompleta</p>
                      <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-50/90">
                        {checklistReview.missingItems.map((item) => (
                          <li key={item.id} className="flex gap-2">
                            <span>•</span>
                            <span>
                              <strong>{item.label}</strong> — {item.hint}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Estado actual</p>
                    <PermissionStatusBadge status={record.permissionStatus} />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Transiciones disponibles</p>
                    <PermissionActions
                      flightPlanId={record.id}
                      currentStatus={record.permissionStatus}
                      transitionBlocks={transitionBlocks}
                    />
                  </div>
                </div>
              </DetailPanel>

              <DetailPanel title="Documentos" description="Adjuntá y gestioná los documentos operativos de este plan.">
                <DocumentUpload flightPlanId={record.id} documents={documents} />
              </DetailPanel>

              <FlightPlanChecklist
                flightPlanId={record.id}
                initialChecklist={record.dgacChecklist}
                suggestedChecklist={suggestedChecklist}
              />

              <DetailPanel
                title="Zona de riesgo"
                description="La eliminación lógica oculta este plan en la app pero preserva su historial."
              >
                <form action={deleteFlightPlan.bind(null, record.id)} className="space-y-3">
                  <p className="text-sm leading-6 text-slate-400">
                    Esta acción lo saca de vistas activas, listados, conteos del panel y acceso a geometría.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/20"
                  >
                    Eliminar plan de vuelo
                  </button>
                </form>
              </DetailPanel>
            </div>

            {/* Right column: timeline + weather */}
            <div className="space-y-6">
              <DetailPanel title="Línea de tiempo" description="Auditoría de eventos vinculados al permiso.">
                <PermissionTimeline events={permissionEvents} />
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

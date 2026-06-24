import Link from "next/link";

import { AlertCard } from "@/components/ui/alert-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { HelpHint } from "@/components/ui/help-hint";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { requirePageAuth } from "@/lib/require-page-auth";
import { FlightPlanForm } from "@/modules/flight-plans/flight-plan-form";
import { PermissionActions } from "@/modules/permissions/permission-actions";
import { PermissionStatusBadge } from "@/modules/permissions/permission-status-badge";
import { PermissionTimeline } from "@/modules/permissions/permission-timeline";
import { DocumentUpload } from "@/modules/permissions/document-upload";
import { FlightPlanChecklist } from "@/modules/dgac/flight-plan-checklist";
import { ReviewerNotes } from "@/modules/reviewer/reviewer-notes";
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
import { canEditEntity } from "@/lib/authorize";

export const dynamic = "force-dynamic";

const STEP_META = [
  { tab: 1, label: "Datos del plan", description: "Identidad, asignaciones y payload" },
  { tab: 2, label: "Geometría", description: "Área de operación y mapa" },
  { tab: 3, label: "Documentos", description: "Adjuntos operativos" },
  { tab: 4, label: "Checklist DGAC", description: "Validación previa al envío" },
  { tab: 5, label: "Permisos", description: "Estado y transiciones" },
  { tab: 6, label: "Cierre", description: "Clima, PDF y riesgo" },
] as const;

type StepTab = (typeof STEP_META)[number]["tab"];

function parseTab(value: string | undefined): StepTab {
  const parsed = Number(value);
  if (parsed >= 1 && parsed <= 6) return parsed as StepTab;
  return 1;
}

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

export default async function FlightPlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const activeTab = parseTab(query.tab);
  const reviewMode = query.review === "1" || query.mode === "review";
  const session = await requirePageAuth(`/flight-plans/${id}`);
  const canEdit = session?.user?.role ? canEditEntity(String(session.user.role)) : false;

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
          <DetailPanel title="Plan de vuelo no encontrado" description="El registro operativo solicitado no existe o ya no está disponible.">
            <p className="text-sm text-slate-500 dark:text-slate-400">Volvé al listado de planes de vuelo y seleccioná un registro válido.</p>
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
    const currentCostCenter = costCenters.find((item) => item.id === record.costCenterId) ?? null;
    const currentClient = clients.find((item) => item.id === record.clientId) ?? null;
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

    const stepHref = (tab: StepTab) => `/flight-plans/${record.id}?tab=${tab}`;

    const stepCompletion: Record<StepTab, boolean> = {
      1: true,
      2: Boolean(record.geometryJson),
      3: documents.length > 0,
      4: Boolean(
        record.dgacChecklist &&
          typeof record.dgacChecklist === "object" &&
          Object.values(record.dgacChecklist as Record<string, unknown>).some(Boolean),
      ),
      5: permissionEvents.length > 0 || record.permissionStatus !== "DRAFT",
      6: Boolean(weatherData && !("error" in weatherData)) || Boolean(persistedChecklist["weather-check"]),
    };

    const completedCount = STEP_META.filter((s) => stepCompletion[s.tab]).length;
    const progressPercent = Math.round((completedCount / STEP_META.length) * 100);

    return (
      <PageShell>
        <div className="space-y-6">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Planes de vuelo", href: "/flight-plans" },
              { label: record.title },
            ]}
          />

          <PageHeader
            eyebrow="Flujo de permisos"
            title={record.title}
            description="Gestioná el registro operativo, el estado del permiso, la documentación y la auditoría."
            actions={
              <>
                <Link
                  href={`/flight-plans/${record.id}?tab=5${reviewMode ? "" : "&review=1"}`}
                  className={`inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    reviewMode
                      ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-slate-800"
                      : "border-cyan-500/30 bg-cyan-50 text-cyan-700 hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
                  }`}
                >
                  {reviewMode ? "Salir de revisión" : "Entrar en revisión"}
                </Link>
                <a
                  href={`/api/reports/flight-plan/${record.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-success/20 dark:border-emerald-400/30 bg-success/5 dark:bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-success dark:text-emerald-100 transition hover:border-success/30 dark:hover:border-emerald-300/50 hover:bg-success/10 dark:hover:bg-emerald-400/20"
                  download
                >
                  <span aria-hidden="true">⬇</span>
                  Reporte PDF
                </a>
                <Link
                  href={`/flight-plans/${record.id}/geometry`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20"
                >
                  <span aria-hidden="true">🗺</span>
                  Abrir mapa operativo
                </Link>
                <StatusBadge
                  status={
                    record.permissionStatus === "AUTHORIZED"
                      ? "approved"
                      : record.permissionStatus === "REJECTED"
                        ? "rejected"
                        : record.permissionStatus === "CLOSED"
                          ? "completed"
                          : record.permissionStatus === "CANCELLED"
                            ? "cancelled"
                            : record.permissionStatus === "EXPIRED"
                              ? "expired"
                              : "in-review"
                  }
                  label={record.permissionStatus}
                  size="sm"
                />
              </>
            }
          />

          <div className="rounded-xl border border-slate-200 bg-slate-50/85 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-300">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">Mapa operativo:</span> revisá el área, la geometría y el contexto visual del vuelo desde un solo lugar.
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-white">Modo revisor:</span>{" "}
                {reviewMode
                  ? "está activo para revisar el plan sin editar datos operativos."
                  : "usalo para comparar y revisar el plan sin tocar datos operativos."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 p-3 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
            {/* Progress bar */}
            <div className="mb-4 flex items-center gap-3 px-1">
              <div className="flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {completedCount}/{STEP_META.length} completados
              </span>
            </div>

            {/* Step tabs */}
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {STEP_META.map((step) => {
                const active = activeTab === step.tab;
                const done = stepCompletion[step.tab];
                return (
                  <Link
                    key={step.tab}
                    href={stepHref(step.tab)}
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      active
                        ? "border-accent/40 dark:border-cyan-400/40 bg-accent/10 dark:bg-cyan-500/15 text-accent-strong dark:text-cyan-100"
                        : done
                          ? "border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/[0.04] text-slate-600 dark:text-slate-300 hover:border-accent/30 dark:hover:border-cyan-500/30 hover:bg-accent/5 dark:hover:bg-cyan-500/5"
                          : "border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/45 text-slate-500 dark:text-slate-400 hover:border-accent/30 dark:hover:border-cyan-500/30 hover:bg-accent/5 dark:hover:bg-cyan-500/5 hover:text-accent-strong dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        done && !active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : active
                            ? "bg-accent/20 dark:bg-cyan-400/20 text-accent-strong dark:text-cyan-100"
                            : "bg-slate-200 dark:bg-slate-950 text-slate-500 dark:text-slate-400"
                      }`}>
                        {done && !active ? "✓" : step.tab}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{step.label}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{step.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {activeTab === 1 && (
            <div className="space-y-6">
              <DetailPanel title="Entidades relacionadas" description="Abrí los registros maestros vinculados a este plan.">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Link href={`/cost-centers/${record.costCenterId}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45 dark:hover:border-accent/40 dark:hover:bg-cyan-500/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Grupo de trabajo</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{currentCostCenter ? `${currentCostCenter.code} · ${currentCostCenter.name}` : "Sin asignar"}</p>
                  </Link>
                  <Link href={`/clients/${record.clientId}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45 dark:hover:border-accent/40 dark:hover:bg-cyan-500/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Cliente</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{currentClient ? currentClient.name : "Sin asignar"}</p>
                  </Link>
                  <Link href={`/drones/${record.droneId}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45 dark:hover:border-accent/40 dark:hover:bg-cyan-500/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Dron</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{currentDrone ? `${currentDrone.model} · ${currentDrone.serialNumber}` : "Sin asignar"}</p>
                  </Link>
                  <Link href={`/operators/${record.operatorId}`} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45 dark:hover:border-accent/40 dark:hover:bg-cyan-500/5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Operador</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{currentOperator ? currentOperator.fullName : "Sin asignar"}</p>
                  </Link>
                </div>
              </DetailPanel>

              {canEdit ? (
                <FlightPlanForm
                  title="Datos del plan"
                  description="Ajustá identidad operativa, fecha, asignaciones y payload canónico."
                  action={updateFlightPlan.bind(null, record.id)}
                  submitLabel="Guardar cambios"
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
              ) : (
                <DetailPanel title="Datos del plan" description="Modo revisión: solo lectura.">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      { label: "Código", value: record.code },
                      { label: "Fecha", value: formatDateInput(record.operationDate) },
                      { label: "Cliente", value: currentClient ? currentClient.name : "Sin asignar" },
                      { label: "Grupo", value: currentCostCenter ? `${currentCostCenter.code} · ${currentCostCenter.name}` : "Sin asignar" },
                      { label: "Dron", value: currentDrone ? `${currentDrone.model} · ${currentDrone.serialNumber}` : "Sin asignar" },
                      { label: "Operador", value: currentOperator ? currentOperator.fullName : "Sin asignar" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">{item.label}</p>
                        <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </DetailPanel>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <DetailPanel title="Geometría" description="Revisá el área de operación y abrí el editor satelital.">
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-slate-950/45">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Estado actual</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{record.geometryType ?? "Sin geometría adjunta todavía"}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {canEdit ? (
                      <Link href={`/flight-plans/${record.id}/geometry`} className="inline-flex items-center justify-center rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20">
                        Abrir editor satelital
                      </Link>
                    ) : null}
                    <Link href={`/flight-plans/${record.id}/geometry`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800">
                      Ver área de operación
                    </Link>
                  </div>
                </div>
              </DetailPanel>
            </div>
          )}

          {activeTab === 3 && (
            <DetailPanel title="Documentos" description="Adjuntá y gestioná los documentos operativos de este plan.">
              <DocumentUpload flightPlanId={record.id} documents={documents} />
            </DetailPanel>
          )}

          {activeTab === 4 && (
            <div className="space-y-6">
              <FlightPlanChecklist
                flightPlanId={record.id}
                initialChecklist={record.dgacChecklist}
                suggestedChecklist={suggestedChecklist}
                geometryLink={record.geometryJson ? `/flight-plans/${record.id}/geometry` : undefined}
              />
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-6">
              {reviewMode ? (
                <ReviewerNotes
                  flightPlanId={record.id}
                  summary={[
                    { label: "Estado actual", value: record.permissionStatus, tone: checklistReview.canSubmit ? "success" : "warning" },
                    { label: "Checklist DGAC", value: checklistReview.canSubmit ? "Completa" : `${checklistReview.missingItems.length} faltantes`, tone: checklistReview.canSubmit ? "success" : "danger" },
                    { label: "Documentos", value: `${documents.length} adjuntos`, tone: documents.length > 0 ? "success" : "warning" },
                    { label: "Historial", value: `${permissionEvents.length} eventos`, tone: permissionEvents.length > 0 ? "info" : "neutral" },
                  ]}
                  missingItems={checklistReview.missingItems.map((item) => item.label)}
                />
              ) : null}

              <DetailPanel title="Flujo de permisos" description="Gestioná el estado del permiso y sus transiciones.">
                <div className="space-y-6">
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Estado de preparación DGAC</p>
                        <HelpHint title="Estado de preparación">
                          Resume si la checklist, los documentos y la geometría ya están listos para enviar el permiso.
                        </HelpHint>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${checklistReview.canSubmit ? "bg-success/10 dark:bg-emerald-500/15 text-success dark:text-emerald-200" : "bg-status-warning/10 dark:bg-amber-500/15 text-status-warning dark:text-amber-200"}`}>
                        {checklistReview.canSubmit ? "Listo para envío" : "Pendiente"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {DGAC_CHECKLIST_ITEMS.map((item) => {
                        const checked = Boolean(checklistReview.effectiveChecklist[item.id]);
                        return (
                          <div
                            key={item.id}
                            className={`rounded-lg border px-3 py-2 text-xs leading-5 ${checked ? "border-success/20 dark:border-emerald-500/20 bg-success/5 dark:bg-emerald-500/[0.04] text-success dark:text-emerald-50" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-300"}`}
                          >
                            <span className="font-medium">{checked ? "✓" : "○"} {item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!checklistReview.canSubmit ? (
                    <AlertCard
                      severity="warning"
                      title="Checklist DGAC incompleta"
                      message={checklistReview.missingItems.map((item) => `${item.label} — ${item.hint}`).join(". ")}
                    />
                  ) : null}

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                      <span>Estado actual</span>
                      <HelpHint title="Estado actual">
                        Este es el estado operacional del permiso. Las transiciones disponibles dependen de este valor.
                      </HelpHint>
                    </div>
                    <PermissionStatusBadge status={record.permissionStatus} />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                      <span>Transiciones disponibles</span>
                      <HelpHint title="Transiciones">
                        Solo aparecen los cambios válidos desde el estado actual. Si alguna acción está bloqueada, la checklist DGAC o los permisos no alcanzan.
                      </HelpHint>
                    </div>
                    {reviewMode ? (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-400">
                        Modo revisor activo: las transiciones quedan deshabilitadas para mantener esta vista en solo lectura.
                      </div>
                    ) : (
                      <PermissionActions
                        flightPlanId={record.id}
                        currentStatus={record.permissionStatus}
                        transitionBlocks={transitionBlocks}
                      />
                    )}
                  </div>
                </div>
              </DetailPanel>
              <DetailPanel title="Línea de tiempo" description="Auditoría de eventos vinculados al permiso.">
                <PermissionTimeline events={permissionEvents} />
              </DetailPanel>
            </div>
          )}

          {activeTab === 6 && (
            <div className="space-y-6">
              <WeatherCard data={weatherData} />
              <DetailPanel
                title="Cierre y riesgo"
                description="Reporte final, eliminación lógica y revisión de salida."
              >
                <div className="space-y-4">
                  <a
                    href={`/api/reports/flight-plan/${record.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-2.5 text-sm font-medium text-success transition hover:border-success/30 hover:bg-success/10 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-100 dark:hover:border-emerald-300/50 dark:hover:bg-emerald-400/20"
                    download
                  >
                    <span aria-hidden="true">⬇</span>
                    Reporte PDF
                  </a>
                  <form action={deleteFlightPlan.bind(null, record.id)} className="space-y-3">
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Esta acción lo saca de vistas activas, listados, conteos del panel y acceso a geometría.
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg border border-status-danger/30 bg-status-danger/10 px-4 py-2.5 text-sm font-medium text-status-danger transition hover:border-status-danger/50 hover:bg-status-danger/15 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:border-rose-400/50 dark:hover:bg-rose-400/20"
                    >
                      Eliminar plan de vuelo
                    </button>
                  </form>
                </div>
              </DetailPanel>
            </div>
          )}
        </div>
      </PageShell>
    );
  } catch {
    return (
      <PageShell>
        <DetailPanel title="Plan de vuelo no disponible" description="No se pudieron cargar los datos. Verificá la conexión a la base de datos.">
          <p className="text-sm text-slate-600 dark:text-slate-400">Recargá la página e intentá de nuevo.</p>
        </DetailPanel>
      </PageShell>
    );
  }
}

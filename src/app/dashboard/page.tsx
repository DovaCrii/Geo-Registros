import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { PageShell } from "@/components/ui/page-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { AlertCard } from "@/components/ui/alert-card";
import { StatusBadge, type OperationalStatus } from "@/components/ui/status-badge";
import { requirePageAuth } from "@/lib/require-page-auth";
import { getDashboardStats } from "@/server/dashboard/queries";
import { OnboardingDialog } from "@/modules/onboarding/onboarding-dialog";

export const dynamic = "force-dynamic";

const ACTIVITY_DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

// ─── Status map ──────────────────────────────────────────────

const STATUS_BADGE: Record<string, OperationalStatus> = {
  DRAFT: "planned",
  IN_REVIEW: "in-review",
  READY_FOR_SUBMISSION: "in-review",
  SUBMITTED: "in-review",
  AUTHORIZED: "approved",
  OBSERVED: "in-review",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CLOSED: "completed",
  CANCELLED: "cancelled",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  READY_FOR_SUBMISSION: "Listo para envío",
  SUBMITTED: "Enviado",
  AUTHORIZED: "Autorizado",
  OBSERVED: "Observado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  READY_FOR_SUBMISSION: "info",
  SUBMITTED: "info",
  AUTHORIZED: "success",
  OBSERVED: "warning",
  REJECTED: "danger",
  EXPIRED: "danger",
  CLOSED: "neutral",
  CANCELLED: "neutral",
};

// ─── Types ────────────────────────────────────────────────────

type NextAction = {
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

type WorkflowStage = {
  step: number;
  title: string;
  description: string;
  href: string;
  state: "active" | "ready" | "done";
};

type PriorityItem = {
  step: number;
  label: string;
  value: number;
  description: string;
  href: string;
  tone: "neutral" | "info" | "warning" | "danger";
};

type ReadinessLevel = "ready" | "caution" | "critical";

function getReadinessLevel(stats: Awaited<ReturnType<typeof getDashboardStats>>): ReadinessLevel {
  const criticalSignals = stats.pending.noGeometry + stats.pending.missingDocuments + stats.pending.observed;
  const cautionSignals = stats.pending.inReview + stats.pending.upcomingFlights + stats.pending.operatorsWithoutLicense + stats.pending.dronesWithoutExpiry;

  if (stats.flightPlans.total === 0 || criticalSignals > 0) return "critical";
  if (cautionSignals > 0 || stats.expiring.drones.length + stats.expiring.operators.length > 0) return "caution";
  return "ready";
}

function ReadinessBanner({ stats }: { stats: Awaited<ReturnType<typeof getDashboardStats>> }) {
  const readiness = getReadinessLevel(stats);
  const levelConfig = {
    ready: {
      label: "Listo para operar",
      tone: "success" as const,
      title: "Semáforo verde: la operación está despejada",
      message: "No hay bloqueos críticos. Mantené el monitoreo de vigencias y seguí con el flujo recomendado.",
      badge: "Verde",
    },
    caution: {
      label: "Precaución",
      tone: "warning" as const,
      title: "Semáforo amarillo: hay puntos que conviene revisar",
      message: "No hay bloqueo total, pero sí vencimientos o seguimientos en curso. Priorizá lo que está arriba en la lista.",
      badge: "Amarillo",
    },
    critical: {
      label: "Atención crítica",
      tone: "danger" as const,
      title: "Semáforo rojo: hay trabajo crítico pendiente",
      message: "Resolvé geometría, documentos o observaciones antes de seguir. El tablero ya te marca el punto de salida.",
      badge: "Rojo",
    },
  }[readiness];

  return (
    <div className={`rounded-xl border p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10 ${
      readiness === "ready"
        ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]"
        : readiness === "caution"
          ? "border-amber-200 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/[0.06]"
          : "border-rose-200 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/[0.06]"
    }`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.26em] ${
            readiness === "ready"
              ? "text-emerald-700 dark:text-emerald-300"
              : readiness === "caution"
                ? "text-amber-700 dark:text-amber-300"
                : "text-rose-700 dark:text-rose-300"
          }`}>
            Semáforo operativo
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{levelConfig.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{levelConfig.message}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <StatusBadge
            status={readiness === "ready" ? "approved" : readiness === "caution" ? "in-review" : "rejected"}
            label={levelConfig.label}
            size="sm"
          />
          <span className="rounded-full border border-current/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">
            {levelConfig.badge}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Timeline ────────────────────────────────────────

function ActivityTimeline({
  events,
}: {
  events: Array<{
    id: string;
    eventType: string;
    createdAt: Date;
    flightPlan: { id: string; code: string; title: string };
    description?: string | null;
  }>;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No hay actividad reciente.</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="relative flex gap-4 pb-6">
          {idx < events.length - 1 && (
            <div className="absolute left-[7px] top-4 h-full w-px bg-slate-300 dark:bg-slate-700" />
          )}
          <div className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-accent/50 bg-accent/20" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              <Link href={`/flight-plans/${event.flightPlan.id}`} className="hover:text-accent dark:hover:text-cyan-300">
                {event.flightPlan.code}
              </Link>
              <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                {ACTIVITY_DATE_FORMATTER.format(event.createdAt)}
              </span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{event.description ?? event.eventType}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Logic helpers ────────────────────────────────────────────

function getNextAction(stats: Awaited<ReturnType<typeof getDashboardStats>>): NextAction {
  if (stats.flightPlans.total === 0) {
    return {
      label: "Primer paso",
      title: "Crear el primer plan de vuelo",
      description: "Empezá cargando una misión para activar el tablero operativo y desbloquear el resto del flujo.",
      href: "/flight-plans/new",
      cta: "Crear plan",
    };
  }
  if (stats.pending.noGeometry > 0) {
    return {
      label: "Prioridad", title: "Definir la zona de operación",
      description: "Hay planes sin geometría. Abrí el editor de área para completar el mapa antes de revisar permisos.",
      href: "/flight-plans", cta: "Revisar planes",
    };
  }
  if (stats.pending.missingDocuments > 0) {
    return {
      label: "Prioridad", title: "Completar la documentación",
      description: "Faltan respaldos en algunos planes. Revisá documentos antes de enviar o cerrar el flujo.",
      href: "/flight-plans", cta: "Ver documentos",
    };
  }
  if (stats.pending.observed > 0) {
    return {
      label: "Prioridad", title: "Resolver observaciones",
      description: "Hay permisos observados. Corregí los puntos pendientes para volver a avanzar.",
      href: "/flight-plans", cta: "Revisar observados",
    };
  }
  if (stats.pending.inReview > 0) {
    return {
      label: "Siguiente paso", title: "Revisar permisos en curso",
      description: "Los planes en revisión necesitan seguimiento operativo antes de la siguiente transición.",
      href: "/flight-plans", cta: "Abrir revisión",
    };
  }
  if (stats.pending.upcomingFlights > 0) {
    return {
      label: "Próximo vuelo", title: "Preparar operaciones próximas",
      description: "Hay vuelos agendados en los próximos días. Confirmá flota, operador y documentos.",
      href: "/flight-plans", cta: "Ver agenda",
    };
  }
  return {
    label: "Mantenimiento", title: "Mantener el tablero al día",
    description: "No hay bloqueos inmediatos. Usá este momento para revisar vigencias y actualizar registros.",
    href: "/dashboard", cta: "Seguir revisando",
  };
}

function getWorkflowStages(stats: Awaited<ReturnType<typeof getDashboardStats>>): WorkflowStage[] {
  const stage2Active = stats.flightPlans.total > 0 && stats.pending.noGeometry > 0;
  const stage3Active = stats.flightPlans.total > 0 && stats.pending.noGeometry === 0 && stats.pending.missingDocuments > 0;
  const stage4Active =
    stats.flightPlans.total > 0 && stats.pending.noGeometry === 0 && stats.pending.missingDocuments === 0 &&
    (stats.pending.observed > 0 || stats.pending.inReview > 0 || stats.pending.upcomingFlights > 0);
  const activeStage = stats.flightPlans.total === 0 ? 1 : stage2Active ? 2 : stage3Active ? 3 : stage4Active ? 4 : 5;

  return [
    { step: 1, title: "Crear misión", description: "Arrancá con un plan de vuelo para activar el flujo.", href: "/flight-plans/new", state: activeStage === 1 ? "active" : "done" as const },
    { step: 2, title: "Definir zona", description: "Dibujá la geometría del área de operación en el mapa.", href: "/flight-plans", state: activeStage === 2 ? "active" : activeStage > 2 ? "done" : "ready" },
    { step: 3, title: "Preparar documentos", description: "Completá respaldos antes del envío o la revisión.", href: "/flight-plans", state: activeStage === 3 ? "active" : activeStage > 3 ? "done" : "ready" },
    { step: 4, title: "Revisar permiso y cierre", description: "Seguimiento, observaciones y cierre operativo.", href: "/flight-plans", state: activeStage === 4 ? "active" : activeStage > 4 ? "done" : "ready" },
  ];
}

function getPriorityItems(stats: Awaited<ReturnType<typeof getDashboardStats>>): PriorityItem[] {
  return [
    { step: 1, label: "Planes sin área de operación", value: stats.pending.noGeometry, description: "Definí geometría antes de enviar a revisión.", href: "/flight-plans", tone: stats.pending.noGeometry > 0 ? ("warning" as const) : ("neutral" as const) },
    { step: 2, label: "Documentos faltantes", value: stats.pending.missingDocuments, description: "Revisá respaldos para evitar bloqueos.", href: "/flight-plans", tone: stats.pending.missingDocuments > 0 ? ("warning" as const) : ("neutral" as const) },
    { step: 3, label: "Permisos observados", value: stats.pending.observed, description: "Corregí observaciones para volver a avanzar.", href: "/flight-plans", tone: stats.pending.observed > 0 ? ("danger" as const) : ("neutral" as const) },
    { step: 4, label: "Permisos en revisión", value: stats.pending.inReview, description: "Dales seguimiento antes de pasar a autorización.", href: "/flight-plans", tone: stats.pending.inReview > 0 ? ("info" as const) : ("neutral" as const) },
    { step: 5, label: "Vuelos próximos", value: stats.pending.upcomingFlights, description: "Confirmá flota, operador y documentos.", href: "/flight-plans", tone: stats.pending.upcomingFlights > 0 ? ("info" as const) : ("neutral" as const) },
    { step: 6, label: "Operadores sin licencia", value: stats.pending.operatorsWithoutLicense, description: "Completar licencias evita fricciones.", href: "/operators", tone: stats.pending.operatorsWithoutLicense > 0 ? ("warning" as const) : ("neutral" as const) },
    { step: 7, label: "Drones sin vigencia", value: stats.pending.dronesWithoutExpiry, description: "Mantené seguros y vencimientos listos.", href: "/drones", tone: stats.pending.dronesWithoutExpiry > 0 ? ("warning" as const) : ("neutral" as const) },
  ].filter((item) => item.value > 0);
}

// ─── View components ──────────────────────────────────────────

function NextActionCard({ action }: { action: NextAction }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10 lg:sticky lg:top-6 lg:z-20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-accent dark:text-cyan-300">{action.label}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{action.title}</h2>
        </div>
        <span className="rounded-full border border-accent/20 dark:border-cyan-200 bg-accent/5 dark:bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent dark:text-cyan-700">Guía</span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{action.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href={action.href} className="inline-flex items-center justify-center rounded-lg border border-accent/30 bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-strong">
          {action.cta}
        </Link>
        <p className="text-xs text-slate-400 dark:text-slate-500">Un solo paso claro para arrancar cada sesión sin perder contexto.</p>
      </div>
    </div>
  );
}

function WorkflowStrip({ stages }: { stages: WorkflowStage[] }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Flujo recomendado</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Orden de trabajo más intuitivo</h2>
        </div>
        <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">4 pasos</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => {
          const stateClasses =
            stage.state === "active"
              ? "border-accent/30 dark:border-cyan-300 bg-accent/5 dark:bg-cyan-50/90 text-accent-strong dark:text-cyan-950 shadow-sm shadow-accent/10 dark:shadow-cyan-100"
              : stage.state === "done"
                ? "border-success/30 dark:border-emerald-200 bg-success/5 dark:bg-emerald-50/80 text-success dark:text-emerald-950"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300";
          const dotClasses =
            stage.state === "active" ? "bg-accent dark:bg-cyan-500" : stage.state === "done" ? "bg-success dark:bg-emerald-500" : "bg-slate-300 dark:bg-slate-600";
          return (
            <Link key={stage.step} href={stage.href} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${stateClasses}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClasses}`} />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Paso {stage.step}</p>
                </div>
                <span className="rounded-full border border-current/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] opacity-80">
                  {stage.state === "active" ? "Activo" : stage.state === "done" ? "Listo" : "Siguiente"}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{stage.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{stage.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PriorityCard({ item }: { item: PriorityItem }) {
  const toneMap = {
    neutral: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/70 text-slate-900 dark:text-slate-200",
    info: "border-accent/30 dark:border-cyan-200 bg-accent/5 dark:bg-cyan-50/90 text-accent-strong dark:text-cyan-950",
    warning: "border-status-warning/30 dark:border-amber-200 bg-status-warning/5 dark:bg-amber-50/90 text-status-warning dark:text-amber-950",
    danger: "border-status-danger/30 dark:border-rose-200 bg-status-danger/5 dark:bg-rose-50/90 text-status-danger dark:text-rose-950",
  } as const;

  return (
    <Link href={item.href} className={`rounded-xl border p-5 shadow-sm dark:shadow-lg transition hover:-translate-y-0.5 hover:shadow-md ${toneMap[item.tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Prioridad {item.step}</p>
          <h3 className="mt-2 text-sm font-semibold">{item.label}</h3>
        </div>
        <span className="rounded-full border border-current/10 px-2 py-1 text-xs font-semibold">{item.value}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
    </Link>
  );
}

function NoPriorityState() {
  return (
    <div className="rounded-xl border border-success/30 dark:border-emerald-200 bg-success/5 dark:bg-emerald-50/80 p-6 shadow-sm dark:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-success dark:text-emerald-700">Todo al día</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">No hay pendientes operativos ahora mismo</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Aprovechá este momento para revisar vigencias, preparar la próxima misión o dejar listo el siguiente plan.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [session, stats, params] = await Promise.all([
    requirePageAuth("/dashboard"),
    getDashboardStats(),
    searchParams,
  ]);

  const userName = session?.user?.name ?? "Usuario";
  const nextAction = getNextAction(stats);
  const workflowStages = getWorkflowStages(stats);
  const pendingActions = getPriorityItems(stats);

  return (
    <PageShell>
      <OnboardingDialog />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent dark:text-cyan-300">Panel operativo</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bienvenido, {userName}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Centro operativo de AeroFlow: seguí el flujo recomendado, resolvé pendientes por impacto y mantené el control sin perder contexto.
          </p>
        </div>

        <ReadinessBanner stats={stats} />

        <NextActionCard action={nextAction} />
        <WorkflowStrip stages={workflowStages} />

        {/* Access denied banner */}
        {params.error === "access-denied" && (
          <AlertCard severity="error" title="Acceso denegado" message="No tenés permisos suficientes para acceder a esa sección. Si creés que esto es un error, contactá al administrador." />
        )}

        {/* Issues banner */}
        {stats.issues.length > 0 && (
          <AlertCard
            severity="warning"
            title="Carga parcial de datos"
            message="Algunas fuentes no respondieron. Igual te mostramos el panel en cero para no romper el flujo."
            action={
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard" className="rounded-lg border border-status-warning/30 bg-status-warning/10 px-3 py-1.5 text-xs font-medium text-status-warning dark:text-amber-200 transition hover:border-status-warning/50 hover:bg-status-warning/20">Reintentar</Link>
                <Link href="/flight-plans/new" className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700">Seguir al flujo correcto</Link>
              </div>
            }
          />
        )}

        {/* Empty state for first-time users */}
        {stats.flightPlans.total === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="No hay actividad operativa todavía"
            description="Este panel muestra el resumen de tus operaciones. Una vez que crees tu primer plan de vuelo, los indicadores y las acciones pendientes aparecerán automáticamente."
            action={{ label: "Crear primer plan de vuelo", href: "/flight-plans/new" }}
            steps={[
              { number: 1, label: "Registrá un dron", description: "Antes de volar, necesitás tener al menos un dron activo en el sistema." },
              { number: 2, label: "Registrá un operador", description: "Cada plan de vuelo necesita un operador RPA responsable." },
              { number: 3, label: "Creá un plan de vuelo", description: "Completá los datos básicos y empezá a operar." },
            ]}
          />
        ) : null}

        {/* Dashboard content for returning users */}
        {stats.flightPlans.total > 0 && (
          <>
            {/* Pending actions */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pendientes operativos</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Ordenados por impacto en el vuelo</h2>
                </div>
                <p className="text-xs text-slate-400">Primero lo que desbloquea la operación</p>
              </div>
              {pendingActions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {pendingActions.map((action) => <PriorityCard key={action.label} item={action} />)}
                </div>
              ) : <NoPriorityState />}
            </div>

            {/* KPI Cards — using MetricCard */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Link href="/flight-plans" className="block">
                <MetricCard icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} value={stats.flightPlans.total} label="Planes de vuelo" />
              </Link>
              <Link href="/drones" className="block">
                <MetricCard icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" /></svg>} value={`${stats.drones.active} / ${stats.drones.total}`} label="Drones activos" />
              </Link>
              <Link href="/operators" className="block">
                <MetricCard icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>} value={stats.operators.total} label="Operadores" />
              </Link>
              <Link href="/clients" className="block">
                <MetricCard icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} value={stats.clients.total} label="Clientes" />
              </Link>
            </div>

            {/* Main grid */}
            <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
              {/* Left column */}
              <div className="space-y-6">
                {/* Vigency alerts */}
                {stats.expiring.drones.length + stats.expiring.operators.length > 0 && (
                  <div className="space-y-3">
                    <AlertCard severity="warning" title="Próximos vencimientos" message="Revisá seguros y licencias antes de las fechas límite." />
                    {stats.expiring.drones.map((drone) => {
                      const expiry = new Date(drone.insuranceExpiry!);
                      const expired = expiry < new Date();
                      return (
                        <Link key={drone.id} href={`/drones/${drone.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-amber-800/40 bg-white dark:bg-amber-950/50 px-4 py-3 text-sm transition hover:bg-slate-50 dark:hover:border-amber-600/40 dark:hover:bg-amber-900/50">
                          <span className="text-slate-700 dark:text-amber-100">Seguro · {drone.code ?? drone.model}</span>
                          <span className={`text-xs font-medium ${expired ? "text-status-danger dark:text-red-400" : "text-status-warning dark:text-amber-300"}`}>{expired ? "Vencido" : expiry.toLocaleDateString("es-CL")}</span>
                        </Link>
                      );
                    })}
                    {stats.expiring.operators.map((op) => {
                      const expiry = new Date(op.licenseExpiry!);
                      const expired = expiry < new Date();
                      return (
                        <Link key={op.id} href={`/operators/${op.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-amber-800/40 bg-white dark:bg-amber-950/50 px-4 py-3 text-sm transition hover:bg-slate-50 dark:hover:border-amber-600/40 dark:hover:bg-amber-900/50">
                          <span className="text-slate-700 dark:text-amber-100">Licencia · {op.fullName}</span>
                          <span className={`text-xs font-medium ${expired ? "text-status-danger dark:text-red-400" : "text-status-warning dark:text-amber-300"}`}>{expired ? "Vencida" : expiry.toLocaleDateString("es-CL")}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Status distribution */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
                  <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900 dark:text-white">Estado de permisos</h2>
                  {stats.flightPlans.total > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.flightPlans.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/55 px-3 py-2">
                          <StatusBadge status={STATUS_BADGE[status] ?? "planned"} label={STATUS_LABELS[status] ?? status} size="sm" />
                          <span className="text-sm font-medium text-slate-800 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No hay planes de vuelo registrados. <Link href="/flight-plans/new" className="text-accent dark:text-cyan-300 hover:text-accent-strong dark:hover:text-cyan-200">Creá el primero</Link></p>
                  )}
                </div>

                {/* Export button */}
                <div className="flex justify-end">
                  <a href="/api/reports/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-success/20 dark:border-emerald-500/20 bg-success/5 dark:bg-emerald-500/10 px-4 py-2 text-xs font-medium text-success dark:text-emerald-200 transition hover:border-success/30 dark:hover:border-emerald-400/30 hover:bg-success/10 dark:hover:bg-emerald-500/20" download>
                    <span aria-hidden="true">⬇</span>
                    Exportar Excel
                  </a>
                </div>

                {/* Recent activity */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
                  <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900 dark:text-white">Actividad reciente</h2>
                  <ActivityTimeline events={stats.recentEvents} />
                </div>
              </div>

              {/* Right: sidebar */}
              <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                {/* Quick links */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
                  <h2 className="mb-2 font-heading text-lg font-semibold text-slate-900 dark:text-white">Atajos operativos</h2>
                  <p className="mb-4 text-sm leading-6 text-slate-500 dark:text-slate-400">Entrá al mapa, creá planes o salí a las entidades clave sin perderte.</p>
                  <div className="space-y-3">
                    <Link href="/flight-plans" className="flex items-center justify-between rounded-lg border border-cyan-500/20 dark:border-cyan-400/20 bg-cyan-50 dark:bg-cyan-500/10 px-4 py-3 text-sm transition hover:bg-cyan-100 dark:hover:border-cyan-300/30 dark:hover:bg-cyan-500/15">
                      <span className="text-slate-700 dark:text-cyan-100">Abrir mapa operativo</span>
                      <span className="text-xs font-medium text-cyan-700 dark:text-cyan-200">planes → mapa</span>
                    </Link>
                    <Link href="/flight-plans/new" className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-sm transition hover:bg-slate-100 dark:hover:border-accent/30 dark:hover:bg-slate-800/70">
                      <span className="text-slate-700 dark:text-slate-300">Crear plan de vuelo</span>
                      <span className="text-xs text-accent dark:text-cyan-300">+</span>
                    </Link>
                    <Link href="/drones" className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-sm transition hover:bg-slate-100 dark:hover:border-accent/30 dark:hover:bg-slate-800/70">
                      <span className="text-slate-700 dark:text-slate-300">Gestionar flota</span>
                      <span className="text-xs text-accent dark:text-cyan-300">→</span>
                    </Link>
                    <Link href="/operators" className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-sm transition hover:bg-slate-100 dark:hover:border-accent/30 dark:hover:bg-slate-800/70">
                      <span className="text-slate-700 dark:text-slate-300">Operadores</span>
                      <span className="text-xs text-accent dark:text-cyan-300">→</span>
                    </Link>
                    <Link href="/cost-centers" className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-3 text-sm transition hover:bg-slate-100 dark:hover:border-accent/30 dark:hover:bg-slate-800/70">
                      <span className="text-slate-700 dark:text-slate-300">Grupos de trabajo</span>
                      <span className="text-xs text-accent dark:text-cyan-300">→</span>
                    </Link>
                  </div>
                </div>

                {/* Recent documents */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
                  <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900 dark:text-white">Documentos recientes</h2>
                  {stats.recentDocuments.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentDocuments.map((doc) => (
                        <div key={doc.id} className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 px-4 py-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{doc.fileName}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{doc.flightPlan.code} · {doc.createdAt.toLocaleDateString("es-CL")}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No hay documentos subidos.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

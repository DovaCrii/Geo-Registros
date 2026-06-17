import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip } from "@/components/ui/status-chip";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { getDashboardStats } from "@/server/dashboard/queries";

export const dynamic = "force-dynamic";

// ─── KPI Card ─────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  accent,
  href,
}: {
  label: string;
  value: string | number;
  accent?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/10 backdrop-blur transition hover:border-cyan-500/30 hover:bg-slate-900/70">
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }

  return inner;
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
    return <p className="text-sm text-slate-500">No hay actividad reciente.</p>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, idx) => (
        <div key={event.id} className="relative flex gap-4 pb-6">
          {/* Connector line */}
          {idx < events.length - 1 && (
            <div className="absolute left-[7px] top-4 h-full w-px bg-slate-800" />
          )}

          {/* Dot */}
          <div className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-cyan-500/50 bg-cyan-500/20" />

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">
              <Link href={`/flight-plans/${event.flightPlan.id}`} className="hover:text-cyan-300">
                {event.flightPlan.code}
              </Link>
              <span className="ml-2 text-xs font-normal text-slate-500">
                {event.createdAt.toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <p className="text-sm text-slate-400">{event.description ?? event.eventType}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge Map ─────────────────────────────────────────

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
      label: "Prioridad",
      title: "Definir la zona de operación",
      description: "Hay planes sin geometría. Abrí el editor de área para completar el mapa antes de revisar permisos.",
      href: "/flight-plans",
      cta: "Revisar planes",
    };
  }

  if (stats.pending.missingDocuments > 0) {
    return {
      label: "Prioridad",
      title: "Completar la documentación",
      description: "Faltan respaldos en algunos planes. Revisá documentos antes de enviar o cerrar el flujo.",
      href: "/flight-plans",
      cta: "Ver documentos",
    };
  }

  if (stats.pending.observed > 0) {
    return {
      label: "Prioridad",
      title: "Resolver observaciones",
      description: "Hay permisos observados. Corregí los puntos pendientes para volver a avanzar en el estado operativo.",
      href: "/flight-plans",
      cta: "Revisar observados",
    };
  }

  if (stats.pending.inReview > 0) {
    return {
      label: "Siguiente paso",
      title: "Revisar permisos en curso",
      description: "Los planes en revisión necesitan seguimiento operativo antes de la siguiente transición.",
      href: "/flight-plans",
      cta: "Abrir revisión",
    };
  }

  if (stats.pending.upcomingFlights > 0) {
    return {
      label: "Próximo vuelo",
      title: "Preparar operaciones próximas",
      description: "Hay vuelos agendados en los próximos días. Confirmá flota, operador y documentos antes de la fecha.",
      href: "/flight-plans",
      cta: "Ver agenda",
    };
  }

  return {
    label: "Mantenimiento",
    title: "Mantener el tablero al día",
    description: "No hay bloqueos inmediatos. Usá este momento para revisar vigencias y actualizar registros operativos.",
    href: "/dashboard",
    cta: "Seguir revisando",
  };
}

function getWorkflowStages(stats: Awaited<ReturnType<typeof getDashboardStats>>): WorkflowStage[] {
  const stage2Active = stats.flightPlans.total > 0 && stats.pending.noGeometry > 0;
  const stage3Active = stats.flightPlans.total > 0 && stats.pending.noGeometry === 0 && stats.pending.missingDocuments > 0;
  const stage4Active =
    stats.flightPlans.total > 0 &&
    stats.pending.noGeometry === 0 &&
    stats.pending.missingDocuments === 0 &&
    (stats.pending.observed > 0 || stats.pending.inReview > 0 || stats.pending.upcomingFlights > 0);

  const activeStage = stats.flightPlans.total === 0 ? 1 : stage2Active ? 2 : stage3Active ? 3 : stage4Active ? 4 : 5;

  return [
    {
      step: 1,
      title: "Crear misión",
      description: "Arrancá con un plan de vuelo para activar el flujo operativo.",
      href: "/flight-plans/new",
      state: activeStage === 1 ? "active" : "done",
    },
    {
      step: 2,
      title: "Definir zona",
      description: "Dibujá la geometría del área de operación en el mapa.",
      href: "/flight-plans",
      state: activeStage === 2 ? "active" : activeStage > 2 ? "done" : "ready",
    },
    {
      step: 3,
      title: "Preparar documentos",
      description: "Completá respaldos antes del envío o la revisión.",
      href: "/flight-plans",
      state: activeStage === 3 ? "active" : activeStage > 3 ? "done" : "ready",
    },
    {
      step: 4,
      title: "Revisar permiso y cierre",
      description: "Seguimiento, observaciones y cierre operativo final.",
      href: "/flight-plans",
      state: activeStage === 4 ? "active" : activeStage > 4 ? "done" : "ready",
    },
  ];
}

function getPriorityItems(stats: Awaited<ReturnType<typeof getDashboardStats>>): PriorityItem[] {
  return [
    {
      step: 1,
      label: "Planes sin área de operación",
      value: stats.pending.noGeometry,
      description: "Definí geometría antes de enviar a revisión o continuar con la misión.",
      href: "/flight-plans",
      tone: stats.pending.noGeometry > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      step: 2,
      label: "Documentos faltantes",
      value: stats.pending.missingDocuments,
      description: "Revisá respaldos para evitar bloqueos en la autorización o cierre.",
      href: "/flight-plans",
      tone: stats.pending.missingDocuments > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      step: 3,
      label: "Permisos observados",
      value: stats.pending.observed,
      description: "Corregí observaciones para volver a avanzar en el estado operativo.",
      href: "/flight-plans",
      tone: stats.pending.observed > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      step: 4,
      label: "Permisos en revisión",
      value: stats.pending.inReview,
      description: "Dales seguimiento antes de pasar a envío o autorización.",
      href: "/flight-plans",
      tone: stats.pending.inReview > 0 ? ("info" as const) : ("neutral" as const),
    },
    {
      step: 5,
      label: "Vuelos próximos",
      value: stats.pending.upcomingFlights,
      description: "Confirmá flota, operador y documentos para las próximas fechas.",
      href: "/flight-plans",
      tone: stats.pending.upcomingFlights > 0 ? ("info" as const) : ("neutral" as const),
    },
    {
      step: 6,
      label: "Operadores sin licencia",
      value: stats.pending.operatorsWithoutLicense,
      description: "Completar licencias evita fricciones al asignar responsables.",
      href: "/operators",
      tone: stats.pending.operatorsWithoutLicense > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      step: 7,
      label: "Drones sin vigencia",
      value: stats.pending.dronesWithoutExpiry,
      description: "Mantené seguros y vencimientos listos para operar sin sobresaltos.",
      href: "/drones",
      tone: stats.pending.dronesWithoutExpiry > 0 ? ("warning" as const) : ("neutral" as const),
    },
  ].filter((item) => item.value > 0);
}

function NextActionCard({ action }: { action: NextAction }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-cyan-50/60 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">{action.label}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{action.title}</h2>
        </div>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
          Guía
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{action.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
        >
          {action.cta}
        </Link>
        <p className="text-xs text-slate-500">
          Un solo paso claro para arrancar cada sesión sin perder contexto.
        </p>
      </div>
    </div>
  );
}

function WorkflowStrip({ stages }: { stages: WorkflowStage[] }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Flujo recomendado</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Orden de trabajo más intuitivo</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          4 pasos
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage) => {
          const stateClasses =
            stage.state === "active"
              ? "border-cyan-300 bg-cyan-50/90 text-cyan-950 shadow-sm shadow-cyan-100"
              : stage.state === "done"
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                : "border-slate-200 bg-slate-50 text-slate-700";

          const dotClasses =
            stage.state === "active"
              ? "bg-cyan-500"
              : stage.state === "done"
                ? "bg-emerald-500"
                : "bg-slate-300";

          return (
            <Link
              key={stage.step}
              href={stage.href}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${stateClasses}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotClasses}`} />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Paso {stage.step}
                  </p>
                </div>
                <span className="rounded-full border border-current/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] opacity-80">
                  {stage.state === "active" ? "Activo" : stage.state === "done" ? "Listo" : "Siguiente"}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{stage.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{stage.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PriorityCard({ item }: { item: PriorityItem }) {
  const toneMap = {
    neutral: "border-slate-200 bg-white text-slate-900",
    info: "border-cyan-200 bg-cyan-50/90 text-cyan-950",
    warning: "border-amber-200 bg-amber-50/90 text-amber-950",
    danger: "border-rose-200 bg-rose-50/90 text-rose-950",
  } as const;

  return (
    <Link
      href={item.href}
      className={`rounded-3xl border p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)] ${toneMap[item.tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Prioridad {item.step}
          </p>
          <h3 className="mt-2 text-sm font-semibold">{item.label}</h3>
        </div>
        <span className="rounded-full border border-current/10 px-2 py-1 text-xs font-semibold">{item.value}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
    </Link>
  );
}

function NoPriorityState() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700">Todo al día</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">No hay pendientes operativos ahora mismo</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
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
  const session = await requirePageAuth("/dashboard");
  const stats = await getDashboardStats();
  const params = await searchParams;

  const userName = session?.user?.name ?? "Usuario";
  const nextAction = getNextAction(stats);
  const workflowStages = getWorkflowStages(stats);
  const pendingActions = getPriorityItems(stats);

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Panel operativo
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bienvenido, {userName}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Centro operativo de AeroFlow: seguí el flujo recomendado, resolvé pendientes por impacto y mantené el control sin perder contexto.
          </p>
        </div>

        <NextActionCard action={nextAction} />
        <WorkflowStrip stages={workflowStages} />

        {/* Access denied banner */}
        {params.error === "access-denied" && (
          <div className="rounded-3xl border border-red-800/40 bg-red-950/25 p-6 shadow-xl shadow-red-950/10 backdrop-blur">
            <h2 className="text-sm font-semibold text-red-100">Acceso denegado</h2>
            <p className="mt-2 text-sm leading-6 text-red-50/80">
              No tenés permisos suficientes para acceder a esa sección. Si creés que esto es un error, contactá al administrador.
            </p>
          </div>
        )}

        {stats.issues.length > 0 ? (
          <div className="rounded-3xl border border-amber-800/40 bg-amber-950/25 p-6 shadow-xl shadow-amber-950/10 backdrop-blur">
            <h2 className="text-sm font-semibold text-amber-100">Carga parcial de datos</h2>
            <p className="mt-2 text-sm leading-6 text-amber-50/80">
              Algunas fuentes no respondieron. Igual te mostramos el panel en cero para no romper el flujo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-400/20">
                Reintentar
              </Link>
              <Link href="/flight-plans/new" className="rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800">
                Seguir al flujo correcto
              </Link>
            </div>
          </div>
        ) : null}

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

        {stats.flightPlans.total > 0 && (
          <>
        {/* Pending actions */}
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Pendientes operativos
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Ordenados por impacto en el vuelo</h2>
            </div>
            <p className="text-xs text-slate-500">Primero lo que desbloquea la operación</p>
          </div>

          {pendingActions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pendingActions.map((action) => (
                <PriorityCard key={action.label} item={action} />
              ))}
            </div>
          ) : (
            <NoPriorityState />
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Planes de vuelo"
            value={stats.flightPlans.total}
            accent="text-cyan-300"
            href="/flight-plans"
          />
          <KpiCard
            label="Drones activos"
            value={`${stats.drones.active} / ${stats.drones.total}`}
            accent="text-emerald-300"
            href="/drones"
          />
          <KpiCard
            label="Operadores"
            value={stats.operators.total}
            accent="text-cyan-300"
            href="/operators"
          />
          <KpiCard
            label="Clientes"
            value={stats.clients.total}
            accent="text-cyan-300"
            href="/clients"
          />
        </div>

        {/* Main grid */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          {/* Left: vigency + status + activity */}
          <div className="space-y-6">
            {/* Vigency alerts */}
            {stats.expiring.drones.length + stats.expiring.operators.length > 0 && (
              <div className="rounded-3xl border border-amber-800/40 bg-amber-950/30 p-6 shadow-xl shadow-amber-950/10 backdrop-blur">
                <h2 className="mb-4 text-lg font-semibold text-amber-200">Próximos vencimientos</h2>
                <div className="space-y-3">
                  {stats.expiring.drones.map((drone) => {
                    const expiry = new Date(drone.insuranceExpiry!);
                    const expired = expiry < new Date();
                    return (
                      <Link
                        key={drone.id}
                        href={`/drones/${drone.id}`}
                        className="flex items-center justify-between rounded-2xl border border-amber-800/40 bg-amber-950/50 px-4 py-3 text-sm transition hover:border-amber-600/40 hover:bg-amber-900/50"
                      >
                        <span className="text-amber-100">
                          Seguro · {drone.code ?? drone.model}
                        </span>
                        <span className={`text-xs font-medium ${expired ? "text-red-400" : "text-amber-300"}`}>
                          {expired ? "Vencido" : expiry.toLocaleDateString("es-CL")}
                        </span>
                      </Link>
                    );
                  })}
                  {stats.expiring.operators.map((op) => {
                    const expiry = new Date(op.licenseExpiry!);
                    const expired = expiry < new Date();
                    return (
                      <Link
                        key={op.id}
                        href={`/operators/${op.id}`}
                        className="flex items-center justify-between rounded-2xl border border-amber-800/40 bg-amber-950/50 px-4 py-3 text-sm transition hover:border-amber-600/40 hover:bg-amber-900/50"
                      >
                        <span className="text-amber-100">
                          Licencia · {op.fullName}
                        </span>
                        <span className={`text-xs font-medium ${expired ? "text-red-400" : "text-amber-300"}`}>
                          {expired ? "Vencida" : expiry.toLocaleDateString("es-CL")}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status distribution */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-white">Estado de permisos</h2>
              {stats.flightPlans.total > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.flightPlans.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/55 px-3 py-2">
                      <StatusChip
                        label={STATUS_LABELS[status] ?? status}
                        tone={STATUS_TONES[status] ?? "neutral"}
                      />
                      <span className="text-sm font-medium text-white">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No hay planes de vuelo registrados.{" "}
                  <Link href="/flight-plans/new" className="text-cyan-300 hover:text-cyan-200">
                    Creá el primero
                  </Link>
                </p>
              )}
            </div>

            {/* Export button */}
            <div className="flex justify-end">
              <a
                href="/api/reports/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-200 transition hover:border-emerald-400/30 hover:bg-emerald-500/20"
                download
              >
                <span>⬇</span>
                Exportar Excel
              </a>
            </div>

            {/* Recent activity */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-white">Actividad reciente</h2>
              <ActivityTimeline events={stats.recentEvents} />
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {/* Quick links */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-white">Acceso rápido</h2>
              <div className="space-y-3">
                <Link
                  href="/flight-plans/new"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-sm transition hover:border-cyan-500/30 hover:bg-slate-800/70"
                >
                  <span className="text-slate-300">Crear plan de vuelo</span>
                  <span className="text-xs text-cyan-300">+</span>
                </Link>
                <Link
                  href="/drones"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-sm transition hover:border-cyan-500/30 hover:bg-slate-800/70"
                >
                  <span className="text-slate-300">Gestionar flota</span>
                  <span className="text-xs text-cyan-300">→</span>
                </Link>
                <Link
                  href="/operators"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-sm transition hover:border-cyan-500/30 hover:bg-slate-800/70"
                >
                  <span className="text-slate-300">Operadores</span>
                  <span className="text-xs text-cyan-300">→</span>
                </Link>
                <Link
                  href="/cost-centers"
                  className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-sm transition hover:border-cyan-500/30 hover:bg-slate-800/70"
                >
                  <span className="text-slate-300">Grupos de trabajo</span>
                  <span className="text-xs text-cyan-300">→</span>
                </Link>
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-white">Documentos recientes</h2>
              {stats.recentDocuments.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentDocuments.map((doc) => (
                    <div key={doc.id} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3">
                      <p className="text-sm text-slate-300">{doc.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {doc.flightPlan.code} · {doc.createdAt.toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No hay documentos subidos.</p>
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

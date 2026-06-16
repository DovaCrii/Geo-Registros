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

function PendingCard({
  label,
  value,
  description,
  href,
  tone = "neutral",
}: {
  label: string;
  value: number;
  description: string;
  href?: string;
  tone?: "neutral" | "info" | "warning" | "danger";
}) {
  const toneMap = {
    neutral: "border-slate-800/80 bg-slate-950/45 hover:border-cyan-500/25",
    info: "border-cyan-500/20 bg-cyan-500/[0.04] hover:border-cyan-400/30",
    warning: "border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-400/30",
    danger: "border-rose-500/20 bg-rose-500/[0.04] hover:border-rose-400/30",
  } as const;

  const inner = (
    <div
      className={`rounded-3xl border p-5 shadow-xl shadow-slate-950/10 backdrop-blur transition ${toneMap[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <span className="rounded-full border border-slate-700/80 bg-slate-950/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
          Acción
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Activity Timeline ────────────────────────────────────────

function ActivityTimeline({
  events,
}: {
  events: Array<{
    id: string;
    eventType: string;
    createdAt: Date;
    flightPlan: { code: string; title: string };
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
              <Link href={`/flight-plans/${event.flightPlan.code}`} className="hover:text-cyan-300">
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

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await requirePageAuth("/dashboard");
  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = null;
  }

  const userName = session?.user?.name ?? "Usuario";

  // If dashboard stats failed to load (DB down), show error state
  if (!stats) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Panel operativo
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Bienvenido, {userName}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Resumen operativo de tu plataforma AeroFlow
            </p>
          </div>

          <div className="rounded-3xl border border-rose-800/40 bg-rose-950/30 p-6 shadow-xl backdrop-blur">
            <h2 className="text-sm font-semibold text-rose-100">No se pudieron cargar los datos del panel</h2>
            <p className="mt-2 text-sm leading-6 text-rose-50/80">
              Verificá que la base de datos esté conectada y recargá la página. Si el problema persiste, revisá la configuración del servidor.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  const pendingActions = [
    {
      label: "Planes sin área de operación",
      value: stats.pending.noGeometry,
      description: "Definí geometría antes de enviar a revisión o usar mapa.",
      href: "/flight-plans",
      tone: stats.pending.noGeometry > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      label: "Permisos en revisión",
      value: stats.pending.inReview,
      description: "Necesitan seguimiento operativo antes del envío DGAC.",
      href: "/flight-plans",
      tone: "info" as const,
    },
    {
      label: "Permisos observados",
      value: stats.pending.observed,
      description: "Requieren corrección documental o técnica.",
      href: "/flight-plans",
      tone: stats.pending.observed > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      label: "Documentos faltantes",
      value: stats.pending.missingDocuments,
      description: "Planes sin respaldo documental completo.",
      href: "/flight-plans",
      tone: stats.pending.missingDocuments > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      label: "Operadores sin licencia",
      value: stats.pending.operatorsWithoutLicense,
      description: "Falta número o vencimiento de licencia.",
      href: "/operators",
      tone: stats.pending.operatorsWithoutLicense > 0 ? ("warning" as const) : ("neutral" as const),
    },
    {
      label: "Drones sin vigencia",
      value: stats.pending.dronesWithoutExpiry,
      description: "No tienen fecha de seguro/documento registrada.",
      href: "/drones",
      tone: stats.pending.dronesWithoutExpiry > 0 ? ("warning" as const) : ("neutral" as const),
    },
  ];

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Panel operativo
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Bienvenido, {userName}
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            Resumen operativo de tu plataforma AeroFlow
          </p>
        </div>

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
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Acciones pendientes
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Lo que requiere atención hoy</h2>
            </div>
            <p className="text-xs text-slate-500">Priorizado por estado operativo</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingActions.map((action) => (
              <PendingCard key={action.label} {...action} />
            ))}
          </div>
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

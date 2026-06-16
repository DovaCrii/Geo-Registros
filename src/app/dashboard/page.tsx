import Link from "next/link";

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
  const stats = await getDashboardStats();

  const userName = session?.user?.name ?? "Usuario";

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
                  <span className="text-slate-300">Nuevo plan de vuelo</span>
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
                  <span className="text-slate-300">Centros de costo</span>
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
      </div>
    </PageShell>
  );
}

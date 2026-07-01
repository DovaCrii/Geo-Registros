import type { DashboardStats } from "@/server/dashboard/queries";
import { uiCardRadius, uiKicker, uiSurface } from "@/components/ui/design-tokens";
import { DetailPanel } from "@/components/ui/detail-panel";

const FP_STATUS_LABELS: Record<string, string> = {
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

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className={`${uiCardRadius} ${uiSurface} p-5`}>
      <p className={uiKicker}>{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function getDateStr(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function OperationsReport({ stats }: { stats: DashboardStats }) {
  const { flightPlans, drones, operators, clients, costCenters, expiring, pending, recentEvents } = stats;

  if (stats.isEmpty) {
    return (
      <DetailPanel title="Sin datos" description="No hay datos suficientes para generar el reporte.">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Completá los datos maestros y creá planes de vuelo para ver el reporte operacional.
        </p>
      </DetailPanel>
    );
  }

  const statusEntries = Object.entries(FP_STATUS_LABELS)
    .map(([key, label]) => ({ key, label, count: flightPlans.byStatus[key] ?? 0 }))
    .filter((e) => e.count > 0);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Planes de vuelo" value={flightPlans.total} sub={`${statusEntries.length} estados diferentes`} />
        <KpiCard label="Drones" value={drones.total} sub={`${drones.active} activos`} />
        <KpiCard label="Operadores" value={operators.total} />
        <KpiCard label="Clientes" value={clients.total} sub={`${costCenters.total} grupos de trabajo`} />
      </div>

      {/* Status distribution */}
      <DetailPanel title="Distribución por estado" description="Planes de vuelo agrupados por estado del permiso.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80">
                <th className="py-2 pr-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Estado</th>
                <th className="py-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {statusEntries.map((entry) => (
                <tr key={entry.key} className="border-b border-slate-100 dark:border-slate-900/40">
                  <td className="py-2.5 pr-4 text-slate-900 dark:text-white">{entry.label}</td>
                  <td className="py-2.5 text-right font-medium text-slate-900 dark:text-white">{entry.count}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2.5 pr-4 text-slate-900 dark:text-white">Total</td>
                <td className="py-2.5 text-right text-slate-900 dark:text-white">{flightPlans.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DetailPanel>

      {/* Expiring items */}
      {(expiring.drones.length > 0 || expiring.operators.length > 0) && (
        <DetailPanel title="Próximos vencimientos" description="Seguros y licencias que vencen en los próximos 30 días.">
          <div className="space-y-4">
            {expiring.drones.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Seguros de drones ({expiring.drones.length})
                </p>
                <div className="space-y-2">
                  {expiring.drones.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-800/80 dark:bg-slate-950/55">
                      <span className="text-sm text-slate-900 dark:text-white">{d.model}</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Vence: {d.insuranceExpiry ? getDateStr(d.insuranceExpiry) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {expiring.operators.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Licencias de operadores ({expiring.operators.length})
                </p>
                <div className="space-y-2">
                  {expiring.operators.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-800/80 dark:bg-slate-950/55">
                      <span className="text-sm text-slate-900 dark:text-white">{o.fullName}</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        Vence: {o.licenseExpiry ? getDateStr(o.licenseExpiry) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DetailPanel>
      )}

      {/* Pending items — issues needing attention */}
      <DetailPanel title="Pendientes" description="Items que requieren atención para mantener la operación al día.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <PendingItem label="Sin geometría" count={pending.noGeometry} />
          <PendingItem label="En revisión" count={pending.inReview} />
          <PendingItem label="Observados" count={pending.observed} />
          <PendingItem label="Vuelos próximos (7 días)" count={pending.upcomingFlights} />
          <PendingItem label="Sin documentos" count={pending.missingDocuments} />
          <PendingItem label="Operadores sin licencia" count={pending.operatorsWithoutLicense} />
          <PendingItem label="Drones sin vencimiento" count={pending.dronesWithoutExpiry} />
        </div>
      </DetailPanel>

      {/* Recent activity */}
      {recentEvents.length > 0 && (
        <DetailPanel title="Actividad reciente" description="Últimos eventos registrados en el sistema.">
          <div className="space-y-2">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-950/55">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900 dark:text-white">
                    {ev.flightPlan?.code ?? "—"} — {ev.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(ev.createdAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DetailPanel>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 print:mt-8">
        Reporte generado el {new Date().toLocaleDateString("es-CL", { dateStyle: "long" })} · AeroFlow
      </div>
    </div>
  );
}

function PendingItem({ label, count }: { label: string; count: number }) {
  const tone = count > 0
    ? "border-amber-500/30 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
    : "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:border-emerald-500/15 dark:bg-emerald-500/10 dark:text-emerald-300";

  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-1 text-lg font-bold">{count}</p>
    </div>
  );
}

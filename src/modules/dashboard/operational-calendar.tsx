import Link from "next/link";

import { StatusChip } from "@/components/ui/status-chip";
import { groupFlightPlansByOperationDate, type OperationalCalendarFlightPlan } from "@/lib/operational-calendar";

export function OperationalCalendar({ flightPlans }: { flightPlans: OperationalCalendarFlightPlan[] }) {
  const grouped = groupFlightPlansByOperationDate(flightPlans);

  return (
    <section id="agenda" className="rounded-xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/45 dark:shadow-xl dark:shadow-slate-950/10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Calendario operativo</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Agenda de próximos vuelos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Vista liviana agrupada por fecha para ver la carga operativa sin abrir cada plan.
          </p>
        </div>
        <StatusChip label={`${flightPlans.length} próximos`} tone={flightPlans.length > 0 ? "info" : "neutral"} />
      </div>

      {grouped.length > 0 ? (
        <div className="mt-5 space-y-4">
          {grouped.map((day) => (
            <div key={day.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{day.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{day.items.length} plan{day.items.length === 1 ? "" : "es"}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  {day.isoDate}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {day.items.map((flightPlan) => (
                  <Link
                    key={flightPlan.id}
                    href={`/flight-plans/${flightPlan.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white bg-white px-4 py-3 text-sm transition hover:border-accent/30 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-cyan-300/30 dark:hover:bg-slate-900"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800 dark:text-white">{flightPlan.code}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{flightPlan.title}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {new Date(flightPlan.operationDate ?? "").toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400">
          No hay vuelos próximos para mostrar en la agenda.
        </div>
      )}
    </section>
  );
}

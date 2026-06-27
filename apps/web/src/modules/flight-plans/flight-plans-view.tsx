import Link from "next/link";
import { ListPage } from "@/components/ui/list-page";
import { PageShell } from "@/components/ui/page-shell";
import { CalendarView } from "@/components/flight-plans/calendar-view";
import { flightPlanListConfig } from "@/modules/flight-plans/flight-plan-list.config";
import { listFlightPlans } from "@/server/flight-plans/queries";
import type { CalendarDay } from "@/server/flight-plans/calendar-queries";

export async function FlightPlansView({
  view,
  calendarData,
  searchParams,
}: {
  view: "table" | "calendar";
  calendarData?: CalendarDay[];
  searchParams: Record<string, string | undefined>;
}) {
  const now = new Date();
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Number(searchParams.month) || now.getMonth() + 1;

  if (view === "calendar") {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 p-6 shadow-sm dark:shadow-2xl dark:shadow-cyan-950/10">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-strong dark:text-cyan-300">
                Bloque 1 / Operación principal
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Plantes de vuelo
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Vista mensual de operaciones programadas. Cada punto representa un plan de vuelo en esa fecha.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Link
                  href={`/flight-plans?view=table&year=${year}&month=${month}`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                >
                  Vista tabla
                </Link>
                <Link
                  href="/flight-plans/new"
                  className="inline-flex items-center justify-center rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20"
                >
                  Crear plan de vuelo
                </Link>
              </div>
            </div>
          </div>
          <CalendarView data={calendarData ?? []} />
        </div>
      </PageShell>
    );
  }

  // Table view: ListPage already includes PageShell
  return <ListPage config={flightPlanListConfig} fetchData={listFlightPlans} searchParams={searchParams} />;
}

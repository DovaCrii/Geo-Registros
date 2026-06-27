import { ListPage } from "@/components/ui/list-page";
import { requirePageAuth } from "@/lib/require-page-auth";
import { flightPlanListConfig } from "@/modules/flight-plans/flight-plan-list.config";
import { FlightPlansView } from "@/modules/flight-plans/flight-plans-view";
import { listFlightPlans } from "@/server/flight-plans/queries";

export const dynamic = "force-dynamic";

export default async function FlightPlansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.page) queryParams.set("page", params.page);
  await requirePageAuth(
    queryParams.toString() ? `/flight-plans?${queryParams.toString()}` : "/flight-plans",
  );

  const view = params.view === "calendar" ? "calendar" : "table";

  try {
    if (view === "calendar") {
      const { getCalendarData } = await import("@/server/flight-plans/calendar-queries");
      const now = new Date();
      const year = Number(params.year) || now.getFullYear();
      const month = Number(params.month) || now.getMonth() + 1;
      const calendarData = await getCalendarData(year, month);
      return <FlightPlansView view="calendar" calendarData={calendarData} searchParams={params} />;
    }

    return <FlightPlansView view="table" searchParams={params} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de base de datos desconocido.";
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Planes de vuelo no disponibles
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            La base de datos no está disponible.
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
    );
  }
}

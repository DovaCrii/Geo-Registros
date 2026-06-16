import { ListPage } from "@/components/ui/list-page";
import { requirePageAuth } from "@/lib/require-page-auth";
import { costCenterListConfig } from "@/modules/cost-centers/cost-center-list.config";
import { listCostCenters } from "@/server/cost-centers/queries";

export const dynamic = "force-dynamic";

export default async function CostCentersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.page) queryParams.set("page", params.page);
  await requirePageAuth(queryParams.toString() ? `/cost-centers?${queryParams.toString()}` : "/cost-centers");

  try {
    return <ListPage config={costCenterListConfig} fetchData={listCostCenters} searchParams={params} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-white">Cost centers unavailable</h2>
          <p className="mt-2 text-sm text-slate-400">The database is not reachable.</p>
          <p className="mt-1 text-sm text-slate-300">{message}</p>
        </div>
      </div>
    );
  }
}

import { ListPage } from "@/components/ui/list-page";
import { requirePageAuth } from "@/lib/require-page-auth";
import { operatorListConfig } from "@/modules/operators/operator-list.config";
import { listOperators } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

export default async function OperatorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.page) queryParams.set("page", params.page);
  await requirePageAuth(queryParams.toString() ? `/operators?${queryParams.toString()}` : "/operators");

  try {
    return <ListPage config={operatorListConfig} fetchData={listOperators} searchParams={params} exportUrl="/api/export/operators" />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de base de datos desconocido.";
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Operadores no disponibles</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">La base de datos no está disponible.</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
    );
  }
}

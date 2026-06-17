import { ListPage } from "@/components/ui/list-page";
import { requirePageAuth } from "@/lib/require-page-auth";
import { clientListConfig } from "@/modules/clients/client-list.config";
import { listClients } from "@/server/clients/queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.page) queryParams.set("page", params.page);
  await requirePageAuth(queryParams.toString() ? `/clients?${queryParams.toString()}` : "/clients");

  try {
    return <ListPage config={clientListConfig} fetchData={listClients} searchParams={params} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de base de datos desconocido.";
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-white">Clientes no disponibles</h2>
          <p className="mt-2 text-sm text-slate-400">La base de datos no está disponible.</p>
          <p className="mt-1 text-sm text-slate-300">{message}</p>
        </div>
      </div>
    );
  }
}

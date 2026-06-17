import { listUsers } from "@/server/users/queries";
import { UsersPageClient } from "./users-page-client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  try {
    const result = await listUsers({
      search: params.q || params.search,
      page: Number(params.page) || 1,
      pageSize: 10,
      sortField: params.sort,
      sortDir: (params.dir as "asc" | "desc") ?? undefined,
      status: params.status,
    });

    // Serialize for client boundary
    const rows = JSON.parse(JSON.stringify(result.rows));

    return <UsersPageClient rows={rows} total={result.total} searchParams={params} />;
  } catch {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-white">Usuarios no disponible</h2>
          <p className="mt-2 text-sm text-slate-400">No se pudo cargar la lista de usuarios. Recargá la página e intentá de nuevo.</p>
        </div>
      </div>
    );
  }
}

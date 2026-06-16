import { ListPage } from "@/components/ui/list-page";
import { userListConfig } from "@/modules/users/user-list.config";
import { batchDeactivateUsers, batchReactivateUsers } from "@/server/users/actions";
import { listUsers } from "@/server/users/queries";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  try {
    return (
      <ListPage
        config={userListConfig}
        fetchData={listUsers}
        searchParams={params}
        batchHandlers={{
          deactivate: batchDeactivateUsers,
          reactivate: batchReactivateUsers,
        }}
      />
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6">
          <h2 className="text-lg font-semibold text-white">Users unavailable</h2>
          <p className="mt-2 text-sm text-slate-400">Could not load user list.</p>
          <p className="mt-1 text-sm text-slate-300">{message}</p>
        </div>
      </div>
    );
  }
}

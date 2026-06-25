"use client";

import { ListPageClient } from "@/components/ui/list-page-client";
import { type UserRow, userListConfig } from "@/modules/users/user-list.config";
import { batchDeactivateUsers, batchReactivateUsers } from "@/server/users/actions";

export function UsersPageClient({
  rows,
  total,
  searchParams,
}: {
  rows: UserRow[];
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <ListPageClient<UserRow>
      config={userListConfig}
      rows={rows}
      total={total}
      searchParams={searchParams}
      batchHandlers={{
        deactivate: batchDeactivateUsers,
        reactivate: batchReactivateUsers,
      }}
    />
  );
}

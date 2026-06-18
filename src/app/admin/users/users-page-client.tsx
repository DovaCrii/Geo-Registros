"use client";

import { userListConfig } from "@/modules/users/user-list.config";
import { ListPageClient } from "@/components/ui/list-page-client";
import {
  batchDeactivateUsers,
  batchReactivateUsers,
} from "@/server/users/actions";

export function UsersPageClient({
  rows,
  total,
  searchParams,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[];
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ListPageClient<any>
      config={userListConfig as any}
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

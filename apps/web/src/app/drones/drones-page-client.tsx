"use client";

import { ListPageClient } from "@/components/ui/list-page-client";
import { droneListConfig } from "@/modules/drones/drone-list.config";
import {
  batchActivateDrones,
  batchDeactivateDrones,
  batchDeleteDrones,
} from "@/server/drones/actions";

export function DronesPageClient({
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
      config={droneListConfig as any}
      rows={rows}
      total={total}
      searchParams={searchParams}
      batchHandlers={{
        activate: batchActivateDrones,
        deactivate: batchDeactivateDrones,
        delete: batchDeleteDrones,
      }}
    />
  );
}

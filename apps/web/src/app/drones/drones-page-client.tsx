"use client";

import { ListPageClient } from "@/components/ui/list-page-client";
import { type DroneRow, droneListConfig } from "@/modules/drones/drone-list.config";
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
  rows: DroneRow[];
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <ListPageClient<DroneRow>
      config={droneListConfig}
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

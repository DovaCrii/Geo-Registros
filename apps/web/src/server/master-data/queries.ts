import { prisma } from "@/lib/prisma";

export type EntitySummary = {
  total: number;
  active: number;
  inactive: number;
};

export type MasterDataSummary = {
  costCenters: EntitySummary;
  clients: EntitySummary;
  drones: EntitySummary;
  operators: EntitySummary;
};

export function summarize<T extends { status: string }>(items: T[]): EntitySummary {
  return {
    total: items.length,
    active: items.filter((x) => x.status === "ACTIVE").length,
    inactive: items.filter((x) => x.status === "INACTIVE").length,
  };
}

export async function getMasterDataSummary(): Promise<MasterDataSummary> {
  const [costCenters, clients, drones, operators] = await Promise.all([
    prisma.costCenter.findMany({ select: { status: true } }),
    prisma.client.findMany({ select: { status: true } }),
    prisma.drone.findMany({ select: { status: true } }),
    prisma.operator.findMany({ select: { status: true } }),
  ]);

  return {
    costCenters: summarize(costCenters),
    clients: summarize(clients),
    drones: summarize(drones),
    operators: summarize(operators),
  };
}

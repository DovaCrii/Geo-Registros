import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [flightPlans, drones, operators, clients, costCenters, recentEvents, recentDocuments] =
    await Promise.all([
      prisma.flightPlan.groupBy({
        by: ["permissionStatus"],
        where: { deletedAt: null },
        _count: true,
      }),

      prisma.drone.groupBy({
        by: ["status"],
        _count: true,
      }),

      prisma.operator.count(),

      prisma.client.count({ where: { deletedAt: null } }),

      prisma.costCenter.count({ where: { deletedAt: null } }),

      prisma.permissionEvent.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          flightPlan: {
            select: { code: true, title: true },
          },
        },
      }),

      prisma.document.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          flightPlan: {
            select: { code: true },
          },
        },
      }),
    ]);

  const totalFlightPlans = flightPlans.reduce((sum, g) => sum + g._count, 0);
  const activeDrones =
    drones.find((g) => g.status === "ACTIVE")?._count ?? 0;
  const totalDrones = drones.reduce((sum, g) => sum + g._count, 0);

  // Build status map
  const statusCounts: Record<string, number> = {};
  for (const g of flightPlans) {
    statusCounts[g.permissionStatus] = g._count;
  }

  return {
    flightPlans: {
      total: totalFlightPlans,
      byStatus: statusCounts,
    },
    drones: {
      total: totalDrones,
      active: activeDrones,
    },
    operators: { total: operators },
    clients: { total: clients },
    costCenters: { total: costCenters },
    recentEvents,
    recentDocuments,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + THIRTY_DAYS_MS);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    flightPlans,
    drones,
    operators,
    clients,
    costCenters,
    recentEvents,
    recentDocuments,
    expiringItems,
    pendingCounts,
  ] =
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

      // Expiring items (next 30 days or already past)
      Promise.all([
        prisma.drone.findMany({
          where: {
            deletedAt: null,
            insuranceExpiry: { lte: thirtyDaysFromNow, not: null },
          },
          select: {
            id: true,
            code: true,
            model: true,
            insuranceExpiry: true,
          },
        }),
        prisma.operator.findMany({
          where: {
            deletedAt: null,
            licenseExpiry: { lte: thirtyDaysFromNow, not: null },
          },
          select: {
            id: true,
            fullName: true,
            licenseExpiry: true,
          },
        }),
      ]),

      Promise.all([
        prisma.flightPlan.count({
          where: { deletedAt: null, geometryJson: { equals: Prisma.DbNull } },
        }),
        prisma.flightPlan.count({
          where: { deletedAt: null, permissionStatus: "IN_REVIEW" },
        }),
        prisma.flightPlan.count({
          where: { deletedAt: null, permissionStatus: "OBSERVED" },
        }),
        prisma.flightPlan.count({
          where: {
            deletedAt: null,
            operationDate: { gte: now, lte: sevenDaysFromNow },
          },
        }),
        prisma.flightPlan.count({
          where: {
            deletedAt: null,
            documents: { none: {} },
          },
        }),
        prisma.operator.count({
          where: {
            deletedAt: null,
            OR: [{ licenseNumber: null }, { licenseExpiry: null }],
          },
        }),
        prisma.drone.count({
          where: {
            deletedAt: null,
            insuranceExpiry: null,
          },
        }),
      ]),
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
    expiring: {
      drones: expiringItems[0],
      operators: expiringItems[1],
    },
    pending: {
      noGeometry: pendingCounts[0],
      inReview: pendingCounts[1],
      observed: pendingCounts[2],
      upcomingFlights: pendingCounts[3],
      missingDocuments: pendingCounts[4],
      operatorsWithoutLicense: pendingCounts[5],
      dronesWithoutExpiry: pendingCounts[6],
    },
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

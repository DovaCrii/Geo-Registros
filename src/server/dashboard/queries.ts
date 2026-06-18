import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + THIRTY_DAYS_MS);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const issues: string[] = [];

  async function settle<T>(label: string, promise: Promise<T>, fallback: T): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      issues.push(label);
      console.error(`[dashboard] ${label} failed`, error);
      return fallback;
    }
  }

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
  ] = await Promise.all([
    settle(
      "flightPlans",
      prisma.flightPlan.groupBy({
        by: ["permissionStatus"],
        where: { deletedAt: null },
        _count: true,
      }),
      [],
    ),

    settle(
      "drones",
      prisma.drone.groupBy({
        by: ["status"],
        _count: true,
      }),
      [],
    ),

    settle("operators", prisma.operator.count(), 0),

    settle("clients", prisma.client.count({ where: { deletedAt: null } }), 0),

    settle("costCenters", prisma.costCenter.count({ where: { deletedAt: null } }), 0),

    settle(
      "recentEvents",
      prisma.permissionEvent.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          flightPlan: {
            select: { id: true, code: true, title: true },
          },
        },
      }),
      [],
    ),

    settle(
      "recentDocuments",
      prisma.document.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          flightPlan: {
            select: { id: true, code: true },
          },
        },
      }),
      [],
    ),

    // Expiring items (next 30 days or already past)
    Promise.all([
      settle(
        "expiringDrones",
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
        [],
      ),
      settle(
        "expiringOperators",
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
        [],
      ),
    ]),

    Promise.all([
      settle(
        "pendingNoGeometry",
        prisma.flightPlan.count({
          where: { deletedAt: null, geometryJson: { equals: Prisma.DbNull } },
        }),
        0,
      ),
      settle(
        "pendingInReview",
        prisma.flightPlan.count({
          where: { deletedAt: null, permissionStatus: "IN_REVIEW" },
        }),
        0,
      ),
      settle(
        "pendingObserved",
        prisma.flightPlan.count({
          where: { deletedAt: null, permissionStatus: "OBSERVED" },
        }),
        0,
      ),
      settle(
        "pendingUpcomingFlights",
        prisma.flightPlan.count({
          where: {
            deletedAt: null,
            operationDate: { gte: now, lte: sevenDaysFromNow },
          },
        }),
        0,
      ),
      settle(
        "pendingMissingDocuments",
        prisma.flightPlan.count({
          where: {
            deletedAt: null,
            documents: { none: {} },
          },
        }),
        0,
      ),
      settle(
        "pendingOperatorsWithoutLicense",
        prisma.operator.count({
          where: {
            deletedAt: null,
            OR: [{ licenseNumber: null }, { licenseExpiry: null }],
          },
        }),
        0,
      ),
      settle(
        "pendingDronesWithoutExpiry",
        prisma.drone.count({
          where: {
            deletedAt: null,
            insuranceExpiry: null,
          },
        }),
        0,
      ),
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
    issues,
    isEmpty: totalFlightPlans === 0 && totalDrones === 0 && operators === 0 && clients === 0 && costCenters === 0,
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

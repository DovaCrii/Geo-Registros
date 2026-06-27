import { prisma } from "@/lib/prisma";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getOperationalPanelData() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + SEVEN_DAYS_MS);
  const thirtyDaysFromNow = new Date(now.getTime() + THIRTY_DAYS_MS);

  const [
    activeFlight,
    upcomingCount,
    expiringDrones,
    expiringOperators,
    inReviewCount,
    observedCount,
  ] = await Promise.all([
    // Next upcoming or in-progress flight
    prisma.flightPlan.findFirst({
      where: {
        deletedAt: null,
        permissionStatus: { in: ["AUTHORIZED", "IN_REVIEW", "OBSERVED"] },
        operationDate: { gte: now, lte: sevenDaysFromNow },
      },
      orderBy: { operationDate: "asc" },
      select: {
        id: true,
        code: true,
        title: true,
        permissionStatus: true,
        operationDate: true,
      },
    }),

    // Total upcoming flights in the next 7 days
    prisma.flightPlan.count({
      where: {
        deletedAt: null,
        operationDate: { gte: now, lte: sevenDaysFromNow },
      },
    }),

    // Expiring drones (30 days)
    prisma.drone.count({
      where: {
        deletedAt: null,
        insuranceExpiry: { lte: thirtyDaysFromNow, not: null },
      },
    }),

    // Expiring operators (30 days)
    prisma.operator.count({
      where: {
        deletedAt: null,
        licenseExpiry: { lte: thirtyDaysFromNow, not: null },
      },
    }),

    // In review count
    prisma.flightPlan.count({
      where: { deletedAt: null, permissionStatus: "IN_REVIEW" },
    }),

    // Observed count
    prisma.flightPlan.count({
      where: { deletedAt: null, permissionStatus: "OBSERVED" },
    }),
  ]);

  return {
    activeFlight,
    upcomingCount,
    expiringDrones,
    expiringOperators,
    inReviewCount,
    observedCount,
    totalAlerts:
      (expiringDrones + expiringOperators + observedCount) as number,
  };
}

export type OperationalPanelData = Awaited<ReturnType<typeof getOperationalPanelData>>;

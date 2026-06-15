import { prisma } from "@/lib/prisma";

export async function getPermissionHistory(flightPlanId: string) {
  return prisma.permissionEvent.findMany({
    where: { flightPlanId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPermissionDocuments(flightPlanId: string) {
  return prisma.document.findMany({
    where: { flightPlanId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFlightPlanWithPermissions(id: string) {
  return prisma.flightPlan.findUnique({
    where: { id },
    include: {
      costCenter: { select: { id: true, code: true, name: true } },
      client: { select: { id: true, name: true } },
      drone: { select: { id: true, model: true, serialNumber: true } },
      operator: { select: { id: true, fullName: true } },
      permissionEvents: { orderBy: { createdAt: "desc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
}

import { prisma } from "@/lib/prisma";

export async function listFlightPlans() {
  return prisma.flightPlan.findMany({
    orderBy: [{ operationDate: "desc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      title: true,
      operationDate: true,
      permissionStatus: true,
      geometryType: true,
      costCenter: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      drone: {
        select: {
          id: true,
          model: true,
          serialNumber: true,
        },
      },
      operator: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
}

export async function getFlightPlanById(id: string) {
  return prisma.flightPlan.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
        title: true,
        operationDate: true,
        permissionStatus: true,
        notes: true,
        geometryJson: true,
        geometryType: true,
        costCenterId: true,
        clientId: true,
        droneId: true,
      operatorId: true,
    },
  });
}

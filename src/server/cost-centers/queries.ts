import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export async function listCostCenters() {
  return prisma.costCenter.findMany({
    orderBy: [{ code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      status: true,
      _count: {
        select: {
          drones: true,
          operators: true,
        },
      },
    },
  });
}

export async function getCostCenterById(id: string) {
  return prisma.costCenter.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      status: true,
    },
  });
}

export async function listActiveCostCenters() {
  return prisma.costCenter.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: [{ code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
}

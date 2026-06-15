import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listDrones() {
  return prisma.drone.findMany({
    orderBy: [{ model: "asc" }, { serialNumber: "asc" }],
    select: {
      id: true,
      code: true,
      serialNumber: true,
      manufacturer: true,
      model: true,
      notes: true,
      status: true,
      costCenter: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });
}

export async function getDroneById(id: string) {
  return prisma.drone.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      serialNumber: true,
      manufacturer: true,
      model: true,
      notes: true,
      status: true,
      costCenterId: true,
    },
  });
}

export async function listActiveDrones() {
  return prisma.drone.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: [{ model: "asc" }, { serialNumber: "asc" }],
    select: {
      id: true,
      code: true,
      serialNumber: true,
      model: true,
    },
  });
}

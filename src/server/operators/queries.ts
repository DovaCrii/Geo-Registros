import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listOperators() {
  return prisma.operator.findMany({
    orderBy: [{ fullName: "asc" }],
    select: {
      id: true,
      code: true,
      fullName: true,
      email: true,
      phone: true,
      licenseNumber: true,
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

export async function getOperatorById(id: string) {
  return prisma.operator.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      fullName: true,
      email: true,
      phone: true,
      licenseNumber: true,
      notes: true,
      status: true,
      costCenterId: true,
    },
  });
}

export async function listActiveOperators() {
  return prisma.operator.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: [{ fullName: "asc" }],
    select: {
      id: true,
      code: true,
      fullName: true,
    },
  });
}

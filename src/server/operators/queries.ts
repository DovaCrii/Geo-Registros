import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listOperators(search?: string, page = 1, pageSize = 10) {
  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { licenseNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.operator.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
          select: { id: true, code: true, name: true },
        },
      },
    }),
    prisma.operator.count({ where }),
  ]);

  return { rows, total };
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

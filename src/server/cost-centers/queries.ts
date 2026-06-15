import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export async function listCostCenters(search?: string, page = 1, pageSize = 10) {
  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.costCenter.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        status: true,
        _count: {
          select: { drones: true, operators: true },
        },
      },
    }),
    prisma.costCenter.count({ where }),
  ]);

  return { rows, total };
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

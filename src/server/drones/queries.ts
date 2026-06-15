import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listDrones(search?: string, page = 1, pageSize = 10) {
  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { serialNumber: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { manufacturer: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.drone.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
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
          select: { id: true, code: true, name: true },
        },
      },
    }),
    prisma.drone.count({ where }),
  ]);

  return { rows, total };
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

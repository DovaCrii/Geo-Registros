import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ListQueryParams } from "@/lib/list-config/types";

export async function listDrones(params?: ListQueryParams) {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const status = params?.status as RecordStatus | undefined;

  const searchClause = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { serialNumber: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { manufacturer: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const statusClause = status ? { status } : {};

  const where = { ...searchClause, ...statusClause, deletedAt: null };

  const orderBy = params?.sortField
    ? { [params.sortField]: params.sortDir ?? "asc" }
    : [{ model: "asc" }, { serialNumber: "asc" }];

  const [rows, total] = await Promise.all([
    prisma.drone.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
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
  return prisma.drone.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      code: true,
      serialNumber: true,
      manufacturer: true,
      model: true,
      notes: true,
      status: true,
      costCenterId: true,
      costCenter: {
        select: { id: true, code: true, name: true },
      },
    },
  });
}

export async function listActiveDrones() {
  return prisma.drone.findMany({
    where: { status: RecordStatus.ACTIVE, deletedAt: null },
    orderBy: [{ model: "asc" }, { serialNumber: "asc" }],
    select: {
      id: true,
      code: true,
      serialNumber: true,
      model: true,
    },
  });
}

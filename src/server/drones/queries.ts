import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ListQueryParams } from "@/lib/list-config/types";

type DroneRow = {
  id: string;
  code: string | null;
  serialNumber: string;
  manufacturer: string | null;
  model: string;
  notes: string | null;
  status: RecordStatus;
  insuranceExpiry: Date | null;
  costCenter: { id: string; code: string; name: string } | null;
};

export async function listDrones(params?: ListQueryParams): Promise<{ rows: DroneRow[]; total: number }> {
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
    ? { [params.sortField]: params.sortDir ?? "asc" } as any
    : [{ model: "asc" }, { serialNumber: "asc" }] as any;

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
        insuranceExpiry: true,
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
      insuranceExpiry: true,
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
      insuranceExpiry: true,
    },
  });
}

import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";
import type { ListQueryParams } from "@/lib/list-config/types";

type CostCenterRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: RecordStatus;
  _count: { drones: number; operators: number };
};

export async function listCostCenters(params?: ListQueryParams): Promise<{ rows: CostCenterRow[]; total: number }> {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const status = params?.status as RecordStatus | undefined;

  const searchClause = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const statusClause = status ? { status } : {};

  const where = { ...searchClause, ...statusClause, deletedAt: null };

  const orderBy = params?.sortField
    ? { [params.sortField]: params.sortDir ?? "asc" } as any
    : [{ code: "asc" }] as any;

  const [rows, total] = await Promise.all([
    prisma.costCenter.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
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
  return prisma.costCenter.findFirst({
    where: { id, deletedAt: null },
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
    where: { status: RecordStatus.ACTIVE, deletedAt: null },
    orderBy: [{ code: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
}

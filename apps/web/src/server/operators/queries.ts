import type { Prisma } from "@prisma/client";
import { RecordStatus } from "@prisma/client";
import type { ListQueryParams } from "@/lib/list-config/types";
import { prisma } from "@/lib/prisma";

type OperatorRow = {
  id: string;
  code: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  notes: string | null;
  status: RecordStatus;
  costCenter: { id: string; code: string; name: string } | null;
};

export async function listOperators(
  params?: ListQueryParams,
): Promise<{ rows: OperatorRow[]; total: number }> {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const status = params?.status as RecordStatus | undefined;

  const searchClause = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { licenseNumber: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const statusClause = status ? { status } : {};

  const where = { ...searchClause, ...statusClause, deletedAt: null };

  const orderBy: Prisma.OperatorOrderByWithRelationInput[] = params?.sortField
    ? [{ [params.sortField]: params.sortDir ?? "asc" } as Prisma.OperatorOrderByWithRelationInput]
    : [{ fullName: "asc" }];

  const [rows, total] = await Promise.all([
    prisma.operator.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        code: true,
        fullName: true,
        email: true,
        phone: true,
        licenseNumber: true,
        licenseExpiry: true,
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
  return prisma.operator.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      code: true,
      fullName: true,
      email: true,
      phone: true,
      licenseNumber: true,
      licenseExpiry: true,
      notes: true,
      status: true,
      costCenterId: true,
      costCenter: {
        select: { id: true, code: true, name: true },
      },
      flightPlans: {
        select: { id: true, code: true, title: true, operationDate: true, permissionStatus: true },
        orderBy: { operationDate: "desc" },
        take: 8,
      },
    },
  });
}

export async function listActiveOperators() {
  return prisma.operator.findMany({
    where: { status: RecordStatus.ACTIVE, deletedAt: null },
    orderBy: [{ fullName: "asc" }],
    select: {
      id: true,
      code: true,
      fullName: true,
      licenseNumber: true,
      licenseExpiry: true,
    },
  });
}

import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ListQueryParams } from "@/lib/list-config/types";

export async function listClients(params?: ListQueryParams) {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const status = params?.status as RecordStatus | undefined;

  const searchClause = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { contactName: { contains: search, mode: "insensitive" as const } },
          { contactEmail: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const statusClause = status ? { status } : {};

  const where = { ...searchClause, ...statusClause, deletedAt: null };

  const orderBy = params?.sortField
    ? { [params.sortField]: params.sortDir ?? "asc" } as any
    : [{ name: "asc" }] as any;

  const [rows, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        code: true,
        name: true,
        contactName: true,
        contactEmail: true,
        notes: true,
        status: true,
      },
    }),
    prisma.client.count({ where }),
  ]);

  return { rows, total };
}

export async function getClientById(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      code: true,
      name: true,
      contactName: true,
      contactEmail: true,
      notes: true,
      status: true,
      flightPlans: {
        select: { id: true, code: true, title: true, operationDate: true, permissionStatus: true },
        orderBy: { operationDate: "desc" },
        take: 8,
      },
    },
  });
}

export async function listActiveClients() {
  return prisma.client.findMany({
    where: { status: RecordStatus.ACTIVE, deletedAt: null },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
}

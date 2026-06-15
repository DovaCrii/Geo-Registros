import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listClients(search?: string, page = 1, pageSize = 10) {
  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
          { contactName: { contains: search, mode: "insensitive" as const } },
          { contactEmail: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ name: "asc" }],
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
  return prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      name: true,
      contactName: true,
      contactEmail: true,
      notes: true,
      status: true,
    },
  });
}

export async function listActiveClients() {
  return prisma.client.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
}

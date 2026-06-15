import { RecordStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function listClients() {
  return prisma.client.findMany({
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
  });
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

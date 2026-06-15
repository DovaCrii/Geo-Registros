import { prisma } from "@/lib/prisma";

export async function listFlightPlans(search?: string, page = 1, pageSize = 10) {
  const searchFilter = search
    ? {
        OR: [
          { code: { contains: search, mode: "insensitive" as const } },
          { title: { contains: search, mode: "insensitive" as const } },
          { costCenter: { name: { contains: search, mode: "insensitive" as const } } },
          { client: { name: { contains: search, mode: "insensitive" as const } } },
          { drone: { model: { contains: search, mode: "insensitive" as const } } },
          { operator: { fullName: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const where = { ...searchFilter, deletedAt: null };

  const [rows, total] = await Promise.all([
    prisma.flightPlan.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ operationDate: "desc" }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        title: true,
        operationDate: true,
        permissionStatus: true,
        geometryType: true,
        costCenter: {
          select: { id: true, code: true, name: true },
        },
        client: {
          select: { id: true, name: true },
        },
        drone: {
          select: { id: true, model: true, serialNumber: true },
        },
        operator: {
          select: { id: true, fullName: true },
        },
      },
    }),
    prisma.flightPlan.count({ where }),
  ]);

  return { rows, total };
}

export async function getFlightPlanById(id: string) {
  return prisma.flightPlan.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      code: true,
      title: true,
      operationDate: true,
      permissionStatus: true,
      notes: true,
      geometryJson: true,
      geometryType: true,
      costCenterId: true,
      clientId: true,
      droneId: true,
      operatorId: true,
    },
  });
}

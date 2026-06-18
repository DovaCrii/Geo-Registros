import { prisma } from "@/lib/prisma";
import type { ListQueryParams } from "@/lib/list-config/types";
import { PermissionStatus } from "@prisma/client";

type FlightPlanRow = {
  id: string;
  code: string;
  title: string;
  operationDate: Date;
  permissionStatus: PermissionStatus;
  geometryType: string | null;
  costCenter: { id: string; code: string; name: string } | null;
  client: { id: string; name: string } | null;
  drone: { id: string; model: string; serialNumber: string } | null;
  operator: { id: string; fullName: string } | null;
};

export async function listFlightPlans(params?: ListQueryParams): Promise<{ rows: FlightPlanRow[]; total: number }> {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const permissionStatus = params?.permissionStatus as string | undefined;

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

  const statusFilter = permissionStatus ? { permissionStatus: permissionStatus as any } : {};

  const where = { ...searchFilter, ...statusFilter, deletedAt: null };

  const orderBy = params?.sortField
    ? { [params.sortField]: params.sortDir ?? "asc" } as any
    : [{ operationDate: "desc" }, { code: "asc" }] as any;

  const [rows, total] = await Promise.all([
    prisma.flightPlan.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
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
      dgacChecklist: true,
      costCenterId: true,
      clientId: true,
      droneId: true,
      operatorId: true,
    },
  });
}

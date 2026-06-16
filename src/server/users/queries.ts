import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { ListQueryParams } from "@/lib/list-config/types";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
};

export async function listUsers(params?: ListQueryParams): Promise<{ rows: UserRow[]; total: number }> {
  const search = params?.search;
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const roleFilter = params?.role as Role | undefined;
  const statusFilter = params?.status as string | undefined;

  const searchClause = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const roleClause = roleFilter ? { role: roleFilter } : {};
  const activeClause =
    statusFilter === "active" ? { active: true } :
    statusFilter === "inactive" ? { active: false } :
    {};

  const orderBy = params?.sortField
    ? { [params.sortField]: params.sortDir ?? "asc" } as any
    : [{ fullName: "asc" }] as any;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where: { ...searchClause, ...roleClause, ...activeClause },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: { ...searchClause, ...roleClause, ...activeClause } }),
  ]);

  return { rows, total };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
}

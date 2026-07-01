import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=...
 *
 * Searches across flight plans, clients, drones, and operators.
 * Returns grouped results with entity type, label, and link.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const term = q;

  // Aggressive search — mode: insensitive supported by SQLite via Prisma
  const insensitive = { contains: term, mode: "insensitive" as const };

  const [flightPlans, clients, drones, operators] = await Promise.all([
    prisma.flightPlan.findMany({
      where: {
        deletedAt: null,
        OR: [
          { code: insensitive },
          { title: insensitive },
        ],
      },
      select: { id: true, code: true, title: true, permissionStatus: true },
      take: 5,
    }),
    prisma.client.findMany({
      where: { deletedAt: null, OR: [{ code: insensitive }, { name: insensitive }, { contactName: insensitive }] },
      select: { id: true, name: true, code: true },
      take: 5,
    }),
    prisma.drone.findMany({
      where: { deletedAt: null, OR: [{ model: insensitive }, { manufacturer: insensitive }, { serialNumber: insensitive }] },
      select: { id: true, model: true, manufacturer: true, serialNumber: true },
      take: 5,
    }),
    prisma.operator.findMany({
      where: { deletedAt: null, OR: [{ fullName: insensitive }, { licenseNumber: insensitive }, { code: insensitive }] },
      select: { id: true, fullName: true, code: true, licenseNumber: true },
      take: 5,
    }),
  ]);

  const results = [
    ...flightPlans.map((fp) => ({
      type: "flight-plan" as const,
      label: `${fp.code} — ${fp.title}`,
      href: `/flight-plans/${fp.id}`,
    })),
    ...clients.map((c) => ({
      type: "client" as const,
      label: `${c.code ?? ""} ${c.name}`.trim(),
      href: `/clients/${c.id}`,
    })),
    ...drones.map((d) => ({
      type: "drone" as const,
      label: `${d.manufacturer ?? ""} ${d.model}`.trim(),
      href: `/drones/${d.id}`,
    })),
    ...operators.map((o) => ({
      type: "operator" as const,
      label: `${o.code ?? ""} ${o.fullName}`.trim(),
      href: `/operators/${o.id}`,
    })),
  ];

  return NextResponse.json({ results });
}

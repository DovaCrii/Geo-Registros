import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/operations/map
 *
 * Returns a GeoJSON FeatureCollection of all flight plans that have
 * geometry data. Used by the global operations map.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.flightPlan.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      code: true,
      title: true,
      operationDate: true,
      permissionStatus: true,
      geometryJson: true,
      geometryType: true,
      costCenter: { select: { code: true } },
      client: { select: { name: true } },
    },
    orderBy: { operationDate: "desc" },
  });

  const features = plans
    .filter((p): p is typeof p & { geometryJson: NonNullable<typeof p.geometryJson> } => p.geometryJson != null)
    .map((p) => ({
      type: "Feature" as const,
      properties: {
        id: p.id,
        code: p.code,
        title: p.title,
        operationDate: p.operationDate.toISOString().slice(0, 10),
        status: p.permissionStatus,
        geometryType: p.geometryType,
        costCenter: p.costCenter?.code ?? "",
        client: p.client?.name ?? "",
      },
      geometry: p.geometryJson,
    }));

  return NextResponse.json({
    type: "FeatureCollection",
    features,
  });
}

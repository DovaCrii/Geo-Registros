import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDashboardExcel } from "@/server/reports/excel-service";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/authorize";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";

export async function GET(request: Request) {
  // Rate limit: 10 exports per minute per IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`dashboard-export:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many exports. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(getRateLimitReset(`dashboard-export:${ip}`)) },
      },
    );
  }

  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await requirePermission("report:export");
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const [flightPlansTotal, dronesTotal, operatorsTotal, clientsTotal] = await Promise.all([
      prisma.flightPlan.count({ where: { deletedAt: null } }),
      prisma.drone.count(),
      prisma.operator.count(),
      prisma.client.count(),
    ]);

    const flightPlansByStatusRaw = await prisma.flightPlan.groupBy({
      by: ["permissionStatus"],
      where: { deletedAt: null },
      _count: { id: true },
    });

    const flightPlansByStatus = flightPlansByStatusRaw.map((s) => ({
      status: s.permissionStatus,
      count: s._count.id,
    }));

    const recentEvents = await prisma.permissionEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        flightPlan: { select: { code: true, title: true } },
      },
    });

    const recentActivity = recentEvents.map((ev) => ({
      date: ev.createdAt.toISOString().slice(0, 10),
      event: ev.eventType === "TRANSITION"
        ? `${ev.fromStatus ?? "—"} → ${ev.toStatus ?? "—"}`
        : ev.eventType.replace(/_/g, " "),
      plan: ev.flightPlan.code,
    }));

    const excelBuffer = generateDashboardExcel({
      flightPlansTotal,
      dronesTotal,
      operatorsTotal,
      clientsTotal,
      flightPlansByStatus,
      recentActivity,
    });

    const fileName = `dashboard-aeroflow-${new Date().toISOString().slice(0, 10)}.xlsx`;

    const bytes = new Uint8Array(excelBuffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Excel generation failed: ${message}`, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFlightPlanReport } from "@/server/reports/pdf-service";
import { getWeatherForecast } from "@/server/weather/service";
import { auth } from "@/lib/auth";
import { requirePermission } from "@/lib/authorize";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Rate limit: 20 reports/min per user
  const rlKey = `report:${session.user.id}`;
  if (!checkRateLimit(rlKey, 20)) {
    return new NextResponse("Too many requests. Try again shortly.", {
      status: 429,
      headers: { "Retry-After": getRateLimitReset(rlKey).toString() },
    });
  }

  try {
    await requirePermission("report:export");
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;

  try {
    const record = await prisma.flightPlan.findFirst({
      where: { id, deletedAt: null },
      include: {
        costCenter: { select: { code: true, name: true } },
        client: { select: { name: true } },
        drone: { select: { model: true, serialNumber: true } },
        operator: { select: { fullName: true } },
        permissionEvents: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        documents: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!record) {
      return new NextResponse("Flight plan not found", { status: 404 });
    }

    const weatherRaw = record.geometryJson
      ? await getWeatherForecast(record.geometryJson, record.operationDate).catch(() => null)
      : null;

    // WeatherError is { error: string } — filter it for the report
    const weather = weatherRaw && "temperatureMax" in weatherRaw ? weatherRaw : null;

    const pdfBuffer = await generateFlightPlanReport({ ...record, weather });

    // Convert Buffer to Uint8Array for Next.js Edge compatibility
    const bytes = new Uint8Array(pdfBuffer);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reporte-${record.code}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Report generation failed: ${message}`, { status: 500 });
  }
}

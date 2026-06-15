import { NextRequest, NextResponse } from "next/server";
import { getMyNotifications } from "@/server/notifications/queries";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 60 requests/min per user (polling-friendly)
  const rlKey = `notif-list:${session.user.id}`;
  if (!checkRateLimit(rlKey, 60)) {
    return NextResponse.json({ error: "Too many requests." }, {
      status: 429,
      headers: { "Retry-After": getRateLimitReset(rlKey).toString() },
    });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "10", 10)));

  const { notifications, total } = await getMyNotifications(page, pageSize);

  return NextResponse.json({
    notifications,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

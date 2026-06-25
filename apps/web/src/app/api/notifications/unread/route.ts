import { NextResponse } from "next/server";
import { countUnreadNotifications } from "@/server/notifications/queries";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 120 requests/min (polled every 30s by NotificationPanel)
  const rlKey = `notif-unread:${session.user.id}`;
  if (!checkRateLimit(rlKey, 120)) {
    return NextResponse.json({ error: "Too many requests." }, {
      status: 429,
      headers: { "Retry-After": getRateLimitReset(rlKey).toString() },
    });
  }

  const count = await countUnreadNotifications();

  return NextResponse.json({ count });
}

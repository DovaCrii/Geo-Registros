import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";
import { transitionPermission } from "@/server/permissions/actions";

export async function POST(request: NextRequest) {
  // CSRF check
  const csrf = validateCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: `CSRF validation failed: ${csrf.reason}` }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 transitions/min per user
  const rlKey = `transition:${session.user.id}`;
  if (!checkRateLimit(rlKey, 30)) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": getRateLimitReset(rlKey).toString() },
      },
    );
  }

  try {
    const body = await request.json();
    const { flightPlanId, newStatus } = body;

    if (!flightPlanId || !newStatus) {
      return NextResponse.json(
        { error: "flightPlanId and newStatus are required." },
        { status: 400 },
      );
    }

    await transitionPermission(flightPlanId, newStatus);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transition failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

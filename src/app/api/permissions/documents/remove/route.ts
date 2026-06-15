import { NextRequest, NextResponse } from "next/server";
import { removeDocument } from "@/server/permissions/actions";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const csrf = validateCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: `CSRF validation failed: ${csrf.reason}` }, { status: 403 });
  }
  // Rate limit: 30 removals per minute per IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`remove:${ip}`, 30, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(getRateLimitReset(`remove:${ip}`)) },
      },
    );
  }

  try {
    const body = await request.json();
    const { flightPlanId, documentId } = body;

    if (!flightPlanId || !documentId) {
      return NextResponse.json({ error: "flightPlanId and documentId are required." }, { status: 400 });
    }

    await removeDocument(flightPlanId, documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Remove failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

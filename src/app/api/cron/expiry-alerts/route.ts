import { NextResponse } from "next/server";

import { runExpiryAlerts } from "@/server/alerts/expiry-alerts";

function isAuthorized(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;

  if (!expected) return false;
  return secret === expected;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runExpiryAlerts();
  return NextResponse.json({ ok: true, summary });
}

import { NextRequest, NextResponse } from "next/server";
import { transitionPermission } from "@/server/permissions/actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightPlanId, newStatus } = body;

    if (!flightPlanId || !newStatus) {
      return NextResponse.json({ error: "flightPlanId and newStatus are required." }, { status: 400 });
    }

    await transitionPermission(flightPlanId, newStatus);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transition failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

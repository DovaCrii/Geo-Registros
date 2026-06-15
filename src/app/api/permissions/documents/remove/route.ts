import { NextRequest, NextResponse } from "next/server";
import { removeDocument } from "@/server/permissions/actions";

export async function POST(request: NextRequest) {
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

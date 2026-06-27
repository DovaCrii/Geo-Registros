import { NextResponse } from "next/server";
import { getOperationalPanelData } from "@/server/operational-panel/queries";

export async function GET() {
  try {
    const data = await getOperationalPanelData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/operational-panel] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch operational panel data" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeChecklist } from "@/modules/dgac/checklist-items";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const checked = normalizeChecklist(body?.checked);

  const updated = await prisma.flightPlan.updateMany({
    where: { id, deletedAt: null },
    data: { dgacChecklist: checked },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Flight plan not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, checked });
}

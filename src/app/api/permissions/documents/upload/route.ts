import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { attachDocument, removeDocument } from "@/server/permissions/actions";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage/documents";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const flightPlanId = formData.get("flightPlanId") as string | null;

    if (!file || !docType || !flightPlanId) {
      return NextResponse.json({ error: "file, docType, and flightPlanId are required." }, { status: 400 });
    }

    // Store file on disk
    const docDir = path.join(STORAGE_ROOT, flightPlanId);
    await mkdir(docDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(docDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create document record
    const doc = await attachDocument(
      flightPlanId,
      docType,
      file.name,
      filePath,
      file.type,
      file.size,
    );

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

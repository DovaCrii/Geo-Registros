import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";

import { NextResponse } from "next/server";

import { getHelpDocById } from "@/server/help-docs/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getHelpDocById(id);

  if (!doc || doc.deletedAt) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const filePath = path.resolve(doc.filePath);
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as any, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `inline; filename="${doc.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

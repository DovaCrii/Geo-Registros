import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
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
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename="${doc.fileName.replace(/"/g, "")}"`,
    },
  });
}

import { createReadStream } from "fs";
import { access } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/permissions/documents/:documentId
 *
 * Serves the uploaded file for download with the original filename.
 * Requires authentication. Returns 404 if the document doesn't exist
 * or has been soft-deleted.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = await params;

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, fileName: true, filePath: true, mimeType: true, deletedAt: true },
  });

  if (!doc || doc.deletedAt) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  // Verify the file exists on disk
  try {
    await access(doc.filePath);
  } catch {
    return NextResponse.json({ error: "File not found on disk." }, { status: 404 });
  }

  // Determine MIME type
  const mimeType = doc.mimeType ?? "application/octet-stream";

  // Stream the file
  const ext = path.extname(doc.fileName);
  const disposition = ext === ".pdf" || ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp"
    ? "inline"
    : "attachment";

  const stream = createReadStream(doc.filePath);

  return new NextResponse(stream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { checkRateLimit, getRateLimitReset } from "@/lib/rate-limit";
import { attachDocument } from "@/server/permissions/actions";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage/documents";

/** Allowed MIME types for document uploads. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.google-earth.kml+xml", // .kml
  "application/vnd.google-earth.kmz", // .kmz
  "application/zip", // .kmz fallback
  "text/plain",
]);

/** Max file size in bytes (20 MB). */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Sanitize a filename to prevent path traversal.
 * Keeps only the basename and strips dangerous characters.
 */
function sanitizeFileName(name: string): string {
  const basename = path.basename(name);
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  // CSRF check
  const csrf = validateCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: `CSRF validation failed: ${csrf.reason}` }, { status: 403 });
  }

  // Auth check
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 uploads per minute per IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(`upload:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(getRateLimitReset(`upload:${ip}`)) },
      },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const flightPlanId = formData.get("flightPlanId") as string | null;

    if (!file || !docType || !flightPlanId) {
      return NextResponse.json(
        { error: "file, docType, and flightPlanId are required." },
        { status: 400 },
      );
    }

    // ── Validation ──────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File exceeds the maximum size of ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `File type "${file.type}" is not allowed. Accepted: PDF, images, DOCX, XLSX, KML/KMZ, TXT.`,
        },
        { status: 415 },
      );
    }

    // ── Storage ─────────────────────────────────────────
    const docDir = path.join(STORAGE_ROOT, flightPlanId);
    await mkdir(docDir, { recursive: true });

    const safeName = sanitizeFileName(file.name);
    const storedName = `${Date.now()}-${safeName}`;
    const filePath = path.join(docDir, storedName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // ── DB record ───────────────────────────────────────
    try {
      const doc = await attachDocument(
        flightPlanId,
        docType,
        file.name,
        filePath,
        file.type,
        file.size,
      );

      return NextResponse.json({ success: true, document: doc });
    } catch {
      // Rollback file if DB insert fails
      await unlink(filePath).catch(() => {});
      throw new Error("Failed to save document record.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

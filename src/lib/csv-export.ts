/**
 * CSV export utility — no dependencies, pure string concatenation.
 */

function escapeCsv(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build a Response with Content-Type text/csv and a Content-Disposition header
 * that triggers a browser download.
 *
 * @param headers  Column header labels (one per column).
 * @param rows     Array of row values, each an array of raw values per column.
 * @param filename Suggested filename (without path).
 */
export function csvResponse(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
  filename: string,
): Response {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compat

  const body =
    BOM +
    headers.map(escapeCsv).join(",") +
    "\n" +
    rows.map((row) => row.map(escapeCsv).join(",")).join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

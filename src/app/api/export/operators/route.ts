import { type NextRequest } from "next/server";

import { csvResponse } from "@/lib/csv-export";
import { listOperators } from "@/server/operators/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await listOperators({
    search: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: 1,
    pageSize: 10_000,
    sortField: searchParams.get("sort") ?? undefined,
    sortDir: (searchParams.get("dir") as "asc" | "desc") ?? undefined,
  });

  const rows = result.rows.map((r) => [
    r.code ?? "",
    r.fullName,
    r.email ?? "",
    r.phone ?? "",
    r.licenseNumber ?? "",
    r.licenseExpiry ? r.licenseExpiry.toISOString().slice(0, 10) : "",
    r.costCenter?.code ?? "",
    r.status === "ACTIVE" ? "Activo" : "Inactivo",
  ]);

  return csvResponse(
    ["Código", "Nombre completo", "Email", "Teléfono", "N° licencia", "Vencimiento licencia", "Grupo de trabajo", "Estado"],
    rows,
    "operadores.csv",
  );
}

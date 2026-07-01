import { type NextRequest } from "next/server";

import { csvResponse } from "@/lib/csv-export";
import { listCostCenters } from "@/server/cost-centers/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await listCostCenters({
    search: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: 1,
    pageSize: 10_000,
    sortField: searchParams.get("sort") ?? undefined,
    sortDir: (searchParams.get("dir") as "asc" | "desc") ?? undefined,
  });

  const rows = result.rows.map((r) => [
    r.code,
    r.name,
    r.description ?? "",
    r._count.drones,
    r._count.operators,
    r.status === "ACTIVE" ? "Activo" : "Inactivo",
  ]);

  return csvResponse(
    ["Código", "Nombre", "Descripción", "Drones vinculados", "Operadores vinculados", "Estado"],
    rows,
    "grupos-de-trabajo.csv",
  );
}

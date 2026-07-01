import { type NextRequest } from "next/server";

import { csvResponse } from "@/lib/csv-export";
import { listClients } from "@/server/clients/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await listClients({
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
    r.contactName,
    r.contactEmail,
    r.status === "ACTIVE" ? "Activo" : "Inactivo",
  ]);

  return csvResponse(
    ["Código", "Cliente", "Contacto", "Email", "Estado"],
    rows,
    "clientes.csv",
  );
}

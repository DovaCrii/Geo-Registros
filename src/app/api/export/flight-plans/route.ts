import { type NextRequest } from "next/server";

import { csvResponse } from "@/lib/csv-export";
import { listFlightPlans } from "@/server/flight-plans/queries";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  READY_FOR_SUBMISSION: "Listo para envío",
  SUBMITTED: "Enviado",
  AUTHORIZED: "Autorizado",
  OBSERVED: "Observado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await listFlightPlans({
    search: searchParams.get("q") ?? undefined,
    permissionStatus: searchParams.get("permissionStatus") ?? undefined,
    page: 1,
    pageSize: 10_000,
    sortField: searchParams.get("sort") ?? undefined,
    sortDir: (searchParams.get("dir") as "asc" | "desc") ?? undefined,
  });

  const rows = result.rows.map((r) => [
    r.code,
    r.title,
    r.operationDate.toISOString().slice(0, 10),
    r.costCenter?.code ?? "",
    r.client?.name ?? "",
    r.drone?.model ?? "",
    r.operator?.fullName ?? "",
    r.geometryType ?? "",
    STATUS_LABELS[r.permissionStatus] ?? r.permissionStatus,
  ]);

  return csvResponse(
    ["Código", "Título", "Fecha operación", "Grupo de trabajo", "Cliente", "Dron", "Operador", "Geometría", "Estado permiso"],
    rows,
    "planes-de-vuelo.csv",
  );
}

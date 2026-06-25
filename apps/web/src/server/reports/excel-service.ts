import * as XLSX from "xlsx";

export type DashboardExportData = {
  flightPlansTotal: number;
  dronesTotal: number;
  operatorsTotal: number;
  clientsTotal: number;
  flightPlansByStatus: Array<{ status: string; count: number }>;
  recentActivity: Array<{ date: string; event: string; plan: string }>;
};

/**
 * Generate a Dashboard Summary Excel workbook as a Buffer.
 */
export function generateDashboardExcel(data: DashboardExportData): Buffer {
  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Summary ─────────────────────────────
  const summaryRows = [
    { Métrica: "Planes de vuelo", Valor: data.flightPlansTotal },
    { Métrica: "Drones registrados", Valor: data.dronesTotal },
    { Métrica: "Operadores", Valor: data.operatorsTotal },
    { Métrica: "Clientes", Valor: data.clientsTotal },
  ];

  const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.sheet_add_aoa(summaryWs, [["Resumen del Dashboard", ""]], { origin: "A1" });
  XLSX.utils.sheet_add_aoa(
    summaryWs,
    [["Generado por Aeroflow", new Date().toISOString().slice(0, 10)]],
    { origin: "A4" },
  );
  XLSX.utils.sheet_add_aoa(summaryWs, [["Métrica", "Valor"]], { origin: "A6" });
  // Fix: our json starts at row 7
  summaryWs["!ref"] = `A1:B${summaryRows.length + 6}`;

  // Style header row
  if (summaryWs["!cols"]) summaryWs["!cols"] = [];
  summaryWs["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen");

  // ─── Sheet 2: Flight Plans by Status ──────────────
  const statusRows = data.flightPlansByStatus.map((s) => ({
    Estado: s.status,
    Cantidad: s.count,
  }));

  const statusWs = XLSX.utils.json_to_sheet(statusRows);
  XLSX.utils.sheet_add_aoa(statusWs, [["Planes de vuelo por estado", ""]], { origin: "A1" });
  XLSX.utils.sheet_add_aoa(statusWs, [["Estado", "Cantidad"]], { origin: "A3" });
  statusWs["!ref"] = `A1:B${statusRows.length + 3}`;
  statusWs["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(wb, statusWs, "Por Estado");

  // ─── Sheet 3: Recent Activity ──────────────────────
  if (data.recentActivity.length > 0) {
    const activityRows = data.recentActivity.map((a) => ({
      Fecha: a.date,
      Evento: a.event,
      "Plan de vuelo": a.plan,
    }));

    const activityWs = XLSX.utils.json_to_sheet(activityRows);
    XLSX.utils.sheet_add_aoa(activityWs, [["Actividad reciente", "", ""]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(activityWs, [["Fecha", "Evento", "Plan de vuelo"]], { origin: "A3" });
    activityWs["!ref"] = `A1:C${activityRows.length + 3}`;
    activityWs["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 25 }];

    XLSX.utils.book_append_sheet(wb, activityWs, "Actividad Reciente");
  }

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

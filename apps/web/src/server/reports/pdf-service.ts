import type {
  Client,
  CostCenter,
  Document,
  Drone,
  Operator,
  PermissionEvent,
} from "@prisma/client";
import PDFDocument from "pdfkit";
import type { WeatherData } from "@/server/weather/service";

export type FlightPlanReportData = {
  code: string;
  title: string;
  operationDate: Date;
  permissionStatus: string;
  notes: string | null;
  geometryType: string | null;
  costCenter: Pick<CostCenter, "code" | "name">;
  client: Pick<Client, "name">;
  drone: Pick<Drone, "model" | "serialNumber">;
  operator: Pick<Operator, "fullName">;
  permissionEvents: PermissionEvent[];
  documents: Document[];
  weather: WeatherData | null;
};

const COLORS = {
  primary: "#080f1e",
  accent: "#22d3ee",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
};

function _statusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: COLORS.muted,
    IN_REVIEW: COLORS.info,
    READY_FOR_SUBMISSION: COLORS.info,
    SUBMITTED: COLORS.info,
    AUTHORIZED: COLORS.success,
    OBSERVED: COLORS.warning,
    REJECTED: COLORS.danger,
    EXPIRED: COLORS.danger,
    CLOSED: COLORS.muted,
    CANCELLED: COLORS.muted,
  };
  return map[status] ?? COLORS.muted;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function windDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

/**
 * Generate a Flight Plan Report PDF as a Buffer.
 * Returns the PDF buffer ready for download.
 */
export function generateFlightPlanReport(data: FlightPlanReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: `Reporte ${data.code} - Aeroflow`,
        Author: "Aeroflow",
        Subject: "Reporte de plan de vuelo",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Header ───────────────────────────────────────
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("Aeroflow", { continued: false })
      .fillColor(COLORS.accent)
      .fontSize(10)
      .font("Helvetica")
      .text("Reporte de Plan de Vuelo", { continued: false })
      .moveDown(0.3);

    // Separator line
    doc.moveTo(55, doc.y).lineTo(540, doc.y).strokeColor(COLORS.border).stroke().moveDown(0.5);

    // ─── Section: Mission Info ────────────────────────
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text(`${data.title}`)
      .moveDown(0.2);

    const infoRows = [
      ["Código interno", data.code],
      ["Fecha de operación", formatDate(data.operationDate)],
      ["Estado del permiso", data.permissionStatus],
      ["Tipo de geometría", data.geometryType ?? "Sin geometría"],
    ];

    infoRows.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.muted)
        .text(`  ${label}:  `, { continued: true })
        .font("Helvetica")
        .fillColor(COLORS.text)
        .text(`${value}`);
    });
    doc.moveDown(0.5);

    // ─── Section: Assignment ──────────────────────────
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(COLORS.primary)
      .text("Asignación")
      .moveDown(0.2);

    const assignRows = [
      ["Grupo de trabajo", `${data.costCenter.code} · ${data.costCenter.name}`],
      ["Cliente", data.client.name],
      ["Dron", `${data.drone.model} · ${data.drone.serialNumber}`],
      ["Operador", data.operator.fullName],
    ];

    assignRows.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(COLORS.muted)
        .text(`  ${label}:  `, { continued: true })
        .font("Helvetica")
        .fillColor(COLORS.text)
        .text(`${value}`);
    });
    doc.moveDown(0.5);

    // ─── Section: Weather ─────────────────────────────
    if (data.weather && "temperatureMax" in data.weather && data.weather.temperatureMax !== null) {
      const w = data.weather;
      const tempUnit = w.unit === "C" ? "°C" : "°F";

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("Condiciones climáticas")
        .moveDown(0.2);

      const weatherRows = [
        [
          "Temperatura mín",
          w.temperatureMin !== null ? `${Math.round(w.temperatureMin)}${tempUnit}` : "--",
        ],
        [
          "Temperatura máx",
          w.temperatureMax !== null ? `${Math.round(w.temperatureMax)}${tempUnit}` : "--",
        ],
        ["Viento máx", w.windSpeedMax !== null ? `${Math.round(w.windSpeedMax)} km/h` : "--"],
        [
          "Dirección",
          w.windDirection !== null
            ? `${windDirection(w.windDirection)} (${w.windDirection}°)`
            : "--",
        ],
      ];

      weatherRows.forEach(([label, value]) => {
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(COLORS.muted)
          .text(`  ${label}:  `, { continued: true })
          .font("Helvetica")
          .fillColor(COLORS.text)
          .text(`${value}`);
      });
      doc
        .fontSize(7)
        .fillColor(COLORS.muted)
        .text("  Datos: Open-Meteo · Pronóstico gratuito", { continued: false });
      doc.moveDown(0.5);
    }

    // ─── Section: Notes ───────────────────────────────
    if (data.notes) {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("Notas")
        .moveDown(0.2)
        .fontSize(9)
        .font("Helvetica")
        .fillColor(COLORS.text)
        .text(data.notes, { indent: 10 })
        .moveDown(0.5);
    }

    // ─── Section: Documents ───────────────────────────
    if (data.documents.length > 0) {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("Documentos asociados")
        .moveDown(0.2);

      data.documents.forEach((d) => {
        const dateStr = formatShortDate(d.createdAt);
        doc
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(`  · ${d.fileName}`, { continued: true })
          .fillColor(COLORS.muted)
          .text(`  (${d.docType})  ${dateStr}`);
      });
      doc.moveDown(0.5);
    }

    // ─── Section: Event Timeline ──────────────────────
    if (data.permissionEvents.length > 0) {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(COLORS.primary)
        .text("Historial de eventos")
        .moveDown(0.2);

      // Show last 10 events
      const recent = data.permissionEvents.slice(0, 10);
      recent.forEach((ev) => {
        const dateStr = formatShortDate(ev.createdAt);
        const eventLabel =
          ev.eventType === "TRANSITION"
            ? `${ev.fromStatus ?? "—"} → ${ev.toStatus ?? "—"}`
            : ev.eventType.replace(/_/g, " ");

        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(COLORS.accent)
          .text(`  ${dateStr}  `, { continued: true })
          .font("Helvetica")
          .fillColor(COLORS.text)
          .text(`${eventLabel}${ev.description ? ` — ${ev.description}` : ""}`);
      });
      doc.moveDown(0.5);
    }

    // ─── Footer ───────────────────────────────────────
    doc
      .fontSize(7)
      .fillColor(COLORS.muted)
      .text(
        `Generado por Aeroflow · ${formatDate(new Date())} · ${data.code}`,
        55,
        doc.page.height - 40,
        { align: "center" },
      );

    doc.end();
  });
}

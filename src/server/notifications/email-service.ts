import { Resend } from "resend";
import type { NotificationType } from "@/server/notifications/service";
import { logEmail } from "@/server/email/log-email";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");

const FROM = process.env.EMAIL_FROM ?? "noreply@aeroflow.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const TYPE_LABELS: Record<string, string> = {
  PERMISSION_TRANSITION: "Actualización de permiso",
  DOCUMENT_ATTACHED: "Documento adjuntado",
  DOCUMENT_REMOVED: "Documento eliminado",
  NOTE_ADDED: "Nota agregada",
};

const TYPE_ICONS: Record<string, string> = {
  PERMISSION_TRANSITION: "🔷",
  DOCUMENT_ATTACHED: "📎",
  DOCUMENT_REMOVED: "🗑",
  NOTE_ADDED: "📝",
};

/**
 * Build a minimal HTML email template for AeroFlow notifications.
 */
function buildHtml(params: {
  title: string;
  message: string;
  type: NotificationType | string;
  link?: string | null;
  recipientName: string;
}): string {
  const label = TYPE_LABELS[params.type] ?? params.type;
  const icon = TYPE_ICONS[params.type] ?? "🔔";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${params.title} — Aeroflow</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;border:1px solid #334155;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 8px;">
              <span style="color:#22d3ee;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">Aeroflow</span>
              <h1 style="color:#f8fafc;font-size:20px;font-weight:600;margin:8px 0 4px;">
                ${icon} ${label}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 32px 24px;">
              <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 4px;">
                Hola <strong style="color:#f8fafc;">${params.recipientName}</strong>,
              </p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:8px 0 0;">
                ${params.message}
              </p>
              ${params.link ? `
              <table cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
                <tr>
                  <td style="background-color:#22d3ee20;border-radius:12px;border:1px solid #22d3ee40;">
                    <a href="${APP_URL}${params.link}" style="display:inline-block;padding:10px 20px;color:#22d3ee;font-size:14px;font-weight:500;text-decoration:none;">
                      Ver en Aeroflow →
                    </a>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #334155;">
              <p style="color:#64748b;font-size:11px;margin:0;">
                Aeroflow · Plataforma de gestión de operaciones RPA<br>
                Este es un mensaje automático. Por favor no respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type NotificationEmailParams = {
  to: string;
  recipientName: string;
  title: string;
  message: string;
  type: NotificationType | string;
  link?: string | null;
};

/**
 * Send a notification email via Resend.
 * Returns true if successful, false if it failed (does NOT throw).
 */
export async function sendNotificationEmail(params: NotificationEmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_...") {
    // Config placeholder — skip silently in dev
    return false;
  }

  const html = buildHtml({
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link,
    recipientName: params.recipientName,
  });

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: `🔔 ${params.title} — Aeroflow`,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      await logEmail({
        to: params.to,
        subject: params.title,
        body: html,
        status: "failed",
        type: params.type,
        error: error.message,
      });
      return false;
    }

    await logEmail({
      to: params.to,
      subject: params.title,
      body: html,
      status: "sent",
      type: params.type,
      flightPlanId: null,
    });

    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    await logEmail({
      to: params.to,
      subject: params.title,
      body: html,
      status: "failed",
      type: params.type,
      error: message,
    });
    return false;
  }
}

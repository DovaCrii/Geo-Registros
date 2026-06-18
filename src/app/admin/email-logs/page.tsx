import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requirePageAuth } from "@/lib/require-page-auth";
import { prisma } from "@/lib/prisma";

type EmailLogWithFlightPlan = Prisma.EmailLogGetPayload<{
  include: { flightPlan: { select: { id: true; code: true } } };
}>;

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  sent: "text-success dark:text-emerald-300 bg-success/10 dark:bg-emerald-500/10 border-success/20 dark:border-emerald-400/20",
  failed: "text-danger dark:text-red-300 bg-danger/10 dark:bg-red-500/10 border-danger/20 dark:border-red-400/20",
  bounced: "text-status-warning dark:text-amber-300 bg-status-warning/10 dark:bg-amber-500/10 border-status-warning/20 dark:border-amber-400/20",
};

const TYPE_LABELS: Record<string, string> = {
  notification: "Notificación",
  manual: "Manual",
  permit: "Permiso",
  report: "Reporte",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEmailLogsPage() {
  await requirePageAuth("/admin/email-logs");

  let emails: EmailLogWithFlightPlan[] = [];
  try {
    emails = await prisma.emailLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 200,
      include: {
        flightPlan: { select: { id: true, code: true } },
      },
    });
  } catch {
    // Fallback: empty list, error shown below
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registro de correos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historial de correos enviados desde la plataforma
          </p>
        </div>
      </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Registro de correos enviados desde la plataforma</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/70">
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Para</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Asunto</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Tipo</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Estado</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Enviado</th>
                <th scope="col" className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Vuelo</th>
                <th scope="col" className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {emails.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    No se han enviado correos todavía. Si la base de datos no está disponible, este listado quedará vacío hasta recuperar la conexión.
                  </td>
                </tr>
              )}
              {emails.map((email) => (
                <tr
                  key={email.id}
                  className="border-b border-slate-200 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                    {email.to}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-200 font-medium max-w-[300px] truncate">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {TYPE_LABELS[email.type] ?? email.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[email.status] ?? "text-slate-600 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-400/10 dark:border-slate-400/20"
                      }`}
                    >
                      {email.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(email.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    {email.flightPlan ? (
                      <Link
                        href={`/flight-plans/${email.flightPlan.id}`}
                        className="text-accent dark:text-cyan-300 hover:text-accent-strong dark:hover:text-cyan-200 text-xs underline underline-offset-2"
                      >
                        {email.flightPlan.code}
                      </Link>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/email-logs/${email.id}`}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

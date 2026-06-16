import Link from "next/link";
import { auth } from "@/lib/auth";
import { requirePageAuth } from "@/lib/require-page-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  sent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  failed: "text-red-400 bg-red-400/10 border-red-400/20",
  bounced: "text-amber-400 bg-amber-400/10 border-amber-400/20",
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

  const emails = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
    include: {
      flightPlan: { select: { id: true, code: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Registro de correos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Historial de correos enviados desde la plataforma
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/80">
                <th className="text-left px-4 py-3 font-medium text-slate-400">Para</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400">Asunto</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400">Enviado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-400">Vuelo</th>
                <th className="text-right px-4 py-3 font-medium text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {emails.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No se han enviado correos todavía.
                  </td>
                </tr>
              )}
              {emails.map((email) => (
                <tr
                  key={email.id}
                  className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">
                    {email.to}
                  </td>
                  <td className="px-4 py-3 text-slate-200 font-medium max-w-[300px] truncate">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400">
                      {TYPE_LABELS[email.type] ?? email.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[email.status] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20"
                      }`}
                    >
                      {email.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(email.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    {email.flightPlan ? (
                      <Link
                        href={`/flight-plans/${email.flightPlan.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-xs underline underline-offset-2"
                      >
                        {email.flightPlan.code}
                      </Link>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/email-logs/${email.id}`}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
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

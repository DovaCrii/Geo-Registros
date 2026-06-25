import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAuth } from "@/lib/require-page-auth";
import { resendEmail } from "@/server/email/actions";

type EmailLogWithFlightPlan = Prisma.EmailLogGetPayload<{
  include: { flightPlan: { select: { id: true; code: true; title: true } } };
}>;

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  notification: "Notificación",
  manual: "Manual",
  permit: "Permiso",
  report: "Reporte",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EmailLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAuth("/admin/email-logs");
  const { id } = await params;

  let email: EmailLogWithFlightPlan | null = null;
  try {
    email = await prisma.emailLog.findUnique({
      where: { id },
      include: {
        flightPlan: { select: { id: true, code: true, title: true } },
      },
    });
  } catch {
    // Fallback: null triggers notFound below
  }

  if (!email) notFound();

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <Link
        href="/admin/email-logs"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        ← Volver al historial
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{email.subject}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {TYPE_LABELS[email.type] ?? email.type} ·{" "}
            <span
              className={
                email.status === "sent"
                  ? "text-success dark:text-emerald-300"
                  : "text-danger dark:text-red-300"
              }
            >
              {email.status}
            </span>
          </p>
        </div>

        {email.status === "failed" && (
          <form action={resendEmail.bind(null, email.id)}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent/10 dark:bg-cyan-500/20 border border-accent/30 dark:border-cyan-500/30 text-accent-strong dark:text-cyan-300 text-sm font-medium hover:bg-accent/15 dark:hover:bg-cyan-500/30 transition-colors"
            >
              Reenviar
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 p-5 space-y-4 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Para</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{email.to}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Enviado</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                {formatDate(email.sentAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo</p>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                {TYPE_LABELS[email.type] ?? email.type}
              </p>
            </div>
            {email.flightPlan && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Plan de vuelo
                </p>
                <Link
                  href={`/flight-plans/${email.flightPlan.id}`}
                  className="text-sm text-accent dark:text-cyan-300 hover:text-accent-strong dark:hover:text-cyan-200 underline underline-offset-2 mt-1 inline-block"
                >
                  {email.flightPlan.code} — {email.flightPlan.title}
                </Link>
              </div>
            )}
            {email.error && (
              <div>
                <p className="text-xs font-medium text-danger dark:text-red-300 uppercase tracking-wider">
                  Error
                </p>
                <p className="text-sm text-danger dark:text-red-300 mt-1 font-mono">
                  {email.error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/50 overflow-hidden shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contenido
              </p>
            </div>
            <div
              className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

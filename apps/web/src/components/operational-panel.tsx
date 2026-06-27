"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { OperationalPanelData } from "@/server/operational-panel/queries";

// ─── Status helpers ──────────────────────────────────────────

const STATUS_META: Record<
  string,
  { label: string; dot: string; bg: string; border: string }
> = {
  AUTHORIZED: {
    label: "Autorizado",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  IN_REVIEW: {
    label: "En revisión",
    dot: "bg-amber-400",
    bg: "bg-amber-50/80 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  OBSERVED: {
    label: "Observado",
    dot: "bg-rose-500",
    bg: "bg-rose-50/80 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/40",
  },
};

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status,
      dot: "bg-slate-400",
      bg: "bg-slate-50/80 dark:bg-slate-800/40",
      border: "border-slate-200 dark:border-slate-700/40",
    }
  );
}

// ─── Icons inline ────────────────────────────────────────────

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

// ─── Pill (collapsed state) ──────────────────────────────────

function PillBadge({
  alerts,
  onClick,
}: {
  alerts: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Abrir panel operativo"
      className="group fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-lg transition hover:shadow-xl hover:-translate-y-0.5 dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-2xl dark:shadow-cyan-950/10"
    >
      <PlaneIcon className="h-4 w-4 text-accent dark:text-cyan-300" />
      {alerts > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {alerts > 9 ? "9+" : alerts}
        </span>
      )}
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-accent dark:group-hover:text-cyan-300">
        Panel
      </span>
    </button>
  );
}

// ─── Expanded panel ──────────────────────────────────────────

function ExpandedPanel({
  data,
  onClose,
}: {
  data: OperationalPanelData;
  onClose: () => void;
}) {
  const hasAlerts =
    data.expiringDrones + data.expiringOperators + data.observedCount > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/80 dark:bg-slate-950/95 dark:shadow-2xl dark:shadow-cyan-950/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <PlaneIcon className="h-4 w-4 text-accent dark:text-cyan-300" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Panel operativo
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Cerrar panel"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
        {/* Active mission */}
        {data.activeFlight ? (
          <Section
            icon={<PlaneIcon className="h-3.5 w-3.5" />}
            label="Misión activa"
          >
            <Link
              href={`/flight-plans/${data.activeFlight.id}`}
              className="block rounded-lg border p-3 transition hover:shadow-sm dark:border-slate-700/60"
            >
              <div className="flex items-center gap-2">
                <StatusDot status={data.activeFlight.permissionStatus} />
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {data.activeFlight.code}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {data.activeFlight.title}
              </p>
              {data.activeFlight.operationDate && (
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {new Date(data.activeFlight.operationDate).toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </Link>
          </Section>
        ) : (
          <Section
            icon={<PlaneIcon className="h-3.5 w-3.5" />}
            label="Próximos vuelos"
          >
            <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
              {data.upcomingCount > 0
                ? `${data.upcomingCount} vuelo(s) programado(s)`
                : "No hay vuelos programados"}
            </p>
          </Section>
        )}

        {/* Pending reviews */}
        <Section
          icon={<AlertIcon className="h-3.5 w-3.5" />}
          label="Alertas operativas"
        >
          {hasAlerts ? (
            <div className="space-y-2">
              {data.inReviewCount > 0 && (
                <AlertRow
                  href="/flight-plans?status=IN_REVIEW"
                  label="En revisión"
                  count={data.inReviewCount}
                  tone="warning"
                />
              )}
              {data.observedCount > 0 && (
                <AlertRow
                  href="/flight-plans?status=OBSERVED"
                  label="Observados"
                  count={data.observedCount}
                  tone="danger"
                />
              )}
              {data.expiringDrones > 0 && (
                <AlertRow
                  href="/drones"
                  label="Seguros por vencer"
                  count={data.expiringDrones}
                  tone="warning"
                />
              )}
              {data.expiringOperators > 0 && (
                <AlertRow
                  href="/operators"
                  label="Licencias por vencer"
                  count={data.expiringOperators}
                  tone="warning"
                />
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-3 text-center text-xs text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
              Todo al día ✓
            </p>
          )}
        </Section>
      </div>

      {/* Footer quick link */}
      <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800/60">
        <Link
          href="/dashboard"
          className="block rounded-md px-2 py-1.5 text-center text-xs font-medium text-accent transition hover:bg-accent/5 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
        >
          Ir al panel completo →
        </Link>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Section({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const meta = statusMeta(status);
  return <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />;
}

function AlertRow({
  href,
  label,
  count,
  tone,
}: {
  href: string;
  label: string;
  count: number;
  tone: "danger" | "warning" | "info";
}) {
  const colors = {
    danger:
      "border-rose-200 bg-rose-50/50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300",
    warning:
      "border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300",
    info: "border-accent/30 bg-accent/5 text-accent-strong dark:border-cyan-800/40 dark:bg-cyan-950/30 dark:text-cyan-300",
  };

  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition hover:opacity-80 ${colors[tone]}`}
    >
      <span>{label}</span>
      <span className="ml-2 font-semibold">{count}</span>
    </Link>
  );
}

// ─── Main component ──────────────────────────────────────────

export function OperationalPanel({ initialData }: { initialData: OperationalPanelData }) {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<OperationalPanelData>(initialData);
  const pathname = usePathname();

  // Close on navigation
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // Refresh every 60 seconds
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/operational-panel");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent fail — panel stays with last known data
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Don't show in full-screen pages or login
  if (
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_")
  ) {
    return null;
  }

  if (!expanded) {
    return <PillBadge alerts={data.totalAlerts} onClick={() => setExpanded(true)} />;
  }

  return <ExpandedPanel data={data} onClose={() => setExpanded(false)} />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FlowGuide } from "@/modules/flow-guide/flow-guide";
import { NotificationPanel } from "@/modules/notifications/notification-panel";

const ALL_NAV_ITEMS = [
  { href: "/", label: "Inicio", primary: true },
  { href: "/dashboard", label: "Panel operativo" },
  { href: "/cost-centers", label: "Grupos de trabajo" },
  { href: "/clients", label: "Clientes" },
  { href: "/drones", label: "Flota RPAS" },
  { href: "/operators", label: "Operadores RPAS" },
  { href: "/flight-plans", label: "Planes de vuelo" },
  { href: "/ayuda", label: "Ayuda DGAC" },
  { href: "/admin/users", label: "Usuarios", adminOnly: true },
  { href: "/admin/email-logs", label: "Registro de correos", adminOnly: true },
];

function NavLinks({ pathname, onClick }: { pathname?: string; onClick?: () => void }) {
  const { data: session, status } = useSession();
  const isAdmin = status === "authenticated" && session?.user?.role === "ADMIN";

  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  function isActive(href: string): boolean {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="space-y-2">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={`flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                item.primary
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/50 hover:bg-cyan-500/15"
                  : active
                    ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-100 shadow-sm shadow-cyan-500/5"
                    : "border-transparent text-slate-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-700/80 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600"
              aria-label={mobileNavOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <span className="text-lg">{mobileNavOpen ? "✕" : "☰"}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
              aria-label="Volver al inicio"
            >
              <span aria-hidden="true">⌂</span>
              <span>Inicio</span>
            </Link>
          </div>
          <NotificationPanel />
        </div>
      </div>

      {/* ── Mobile nav overlay ─────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/95 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</p>
           <h1 className="text-2xl font-semibold text-white">Espacio operacional</h1>
           <p className="text-sm leading-6 text-slate-400">
              Base de datos maestra para operaciones de vuelo, documentos y flujos geoespaciales.
            </p>
        </div>

        <NavLinks pathname={pathname} onClick={() => setMobileNavOpen(false)} />
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-4 px-4 py-6 sm:px-6 lg:px-8">
        {/* Desktop sidebar (always visible) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur lg:sticky lg:top-6">
            <div className="mb-8 space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</p>
              <h1 className="text-2xl font-semibold text-white">Espacio operacional</h1>
              <p className="text-sm leading-6 text-slate-400">
                Base de datos maestra para operaciones de vuelo, documentos y flujos geoespaciales.
              </p>
            </div>
            <NavLinks pathname={pathname} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
            >
              <span aria-hidden="true">⌂</span>
              <span>Inicio</span>
            </Link>
            <NotificationPanel />
          </div>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <FlowGuide />
    </div>
  );
}

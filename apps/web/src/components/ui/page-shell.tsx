"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { FieldModeToggle } from "@/components/field-mode-toggle";
import { FlowGuide } from "@/modules/flow-guide/flow-guide";
import { NotificationPanel } from "@/modules/notifications/notification-panel";

const ALL_NAV_ITEMS = [
  { href: "/dashboard", label: "Panel operativo", primary: true },
  { href: "/cost-centers", label: "Grupos de trabajo" },
  { href: "/clients", label: "Clientes" },
  { href: "/drones", label: "Flota RPAS" },
  { href: "/operators", label: "Operadores RPAS" },
  { href: "/flight-plans", label: "Planes de vuelo" },
  { href: "/master-data", label: "Datos maestros" },
  { href: "/ayuda", label: "Ayuda DGAC" },
  { href: "/admin/users", label: "Usuarios", adminOnly: true },
  { href: "/admin/email-logs", label: "Registro de correos", adminOnly: true },
  { href: "/admin/help-docs", label: "Documentación DGAC", adminOnly: true },
];

// ─── Theme-aware nav classes ───────────────────────────

const navItemBase =
  "flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition";
const navItemPrimary =
  "border-accent/30 bg-accent/10 text-accent-strong dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 hover:border-accent/50 hover:bg-accent/15 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/15";
const navItemActive =
  "border-accent/40 bg-accent/15 text-accent-strong dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-100 shadow-sm shadow-accent/5 dark:shadow-cyan-500/5";
const navItemInactive =
  "border-transparent text-slate-600 dark:text-slate-300 hover:border-accent/30 hover:bg-accent/5 hover:text-accent-strong dark:hover:border-cyan-500/30 dark:hover:bg-cyan-500/5 dark:hover:text-cyan-200";

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
    <nav className="space-y-1.5">
      {visibleItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`${navItemBase} ${
              item.primary ? navItemPrimary : active ? navItemActive : navItemInactive
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Sidebar content (shared between mobile + desktop) ──

function SidebarContent({ pathname, onClick }: { pathname?: string; onClick?: () => void }) {
  const { data: session } = useSession();

  return (
    <>
      <Link href="/dashboard" className="group mb-6 block space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent transition group-hover:text-accent-strong dark:text-cyan-300 dark:group-hover:text-cyan-200">
          AeroFlow
        </p>
        <h2 className="font-heading text-xl font-semibold text-slate-900 transition group-hover:text-accent-strong dark:text-white dark:group-hover:text-cyan-200">
          Espacio operacional
        </h2>
        <p className="text-sm leading-5 text-slate-500 transition group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
          Base de datos maestra para operaciones de vuelo, documentos y flujos geoespaciales.
        </p>
      </Link>
      <NavLinks pathname={pathname} onClick={onClick} />

      {/* User menu */}
      {session?.user && (
        <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-medium text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300">
              {session.user.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {session.user.name ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {session.user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>

          {/* Field mode toggle */}
          <div className="mt-3">
            <FieldModeToggle />
          </div>
        </div>
      )}
    </>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100">
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700/80 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-600"
              aria-label={mobileNavOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <span className="text-lg leading-none">{mobileNavOpen ? "✕" : "☰"}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent dark:text-cyan-300">
                AeroFlow
              </span>
            </button>
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-accent/30 hover:text-accent dark:border-slate-700/60 dark:text-slate-400 dark:hover:border-cyan-500/30 dark:hover:text-cyan-200"
              >
                Panel
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FieldModeToggle />
            <NotificationPanel />
          </div>
        </div>
      </div>

      {/* ── Mobile nav overlay ─────────────────────────── */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Cerrar navegación móvil"
          className="fixed inset-0 z-30 bg-black/20 dark:bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMobileNavOpen(false);
          }}
        />
      )}

      {/* ── Mobile sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 p-5 shadow-lg dark:shadow-2xl dark:shadow-cyan-950/10 backdrop-blur transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} onClick={() => setMobileNavOpen(false)} />
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8 field-mode-main">
        {/* Desktop sidebar (always visible) */}
        <aside className="hidden w-64 shrink-0 lg:block field-mode-sidebar">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 p-5 shadow-sm dark:shadow-2xl dark:shadow-cyan-950/10 lg:sticky lg:top-6">
            <SidebarContent pathname={pathname} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-4 hidden items-center justify-end gap-3 lg:flex">
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="text-xs font-medium text-slate-400 transition hover:text-accent dark:text-slate-500 dark:hover:text-cyan-300"
              >
                ← Volver al panel
              </Link>
            )}
            <NotificationPanel />
          </div>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <FlowGuide />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
const FIELD_MODE_STORAGE_KEY = "aeroflow:field-mode";
const FIELD_MODE_TOGGLE_BASE = "rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition";
const FIELD_MODE_TOGGLE_ACTIVE =
  "border-accent/30 bg-accent/10 text-accent-strong dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-100";
const FIELD_MODE_TOGGLE_INACTIVE =
  "border-slate-300 bg-white text-slate-600 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-300";

function getFieldModeToggleClass(fieldMode: boolean) {
  return `${FIELD_MODE_TOGGLE_BASE} ${fieldMode ? FIELD_MODE_TOGGLE_ACTIVE : FIELD_MODE_TOGGLE_INACTIVE}`;
}

function getActiveNavItem(pathname?: string) {
  if (!pathname) return ALL_NAV_ITEMS[0];

  return ALL_NAV_ITEMS.reduce((current, item) => {
    const currentMatch = pathname.startsWith(current.href) ? current.href.length : -1;
    const nextMatch = pathname.startsWith(item.href) ? item.href.length : -1;
    return nextMatch > currentMatch ? item : current;
  }, ALL_NAV_ITEMS[0]);
}

function NavLinks({ pathname, onClick, fieldMode }: { pathname?: string; onClick?: () => void; fieldMode: boolean }) {
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
        const className = item.primary
          ? active
            ? navItemPrimary
            : `${navItemInactive} border-slate-200/80 dark:border-slate-800/60`
          : active
            ? navItemActive
            : navItemInactive;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={`${navItemBase} ${fieldMode ? "min-h-12 px-5 py-3 text-base" : "px-4 py-2.5 text-sm"} ${className}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Sidebar content (shared between mobile + desktop) ──

function SidebarContent({ pathname, onClick, fieldMode }: { pathname?: string; onClick?: () => void; fieldMode: boolean }) {
  const { data: session } = useSession();
  const activeItem = getActiveNavItem(pathname);

  return (
    <>
      <div className={`mb-5 rounded-xl border border-slate-200/80 dark:border-slate-800/70 bg-slate-50/80 dark:bg-slate-900/40 text-left shadow-sm dark:shadow-none ${fieldMode ? "p-5" : "p-4"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
          Sección actual
        </p>
        <h2 className={`mt-2 font-heading font-semibold text-slate-900 dark:text-white ${fieldMode ? "text-[1.35rem]" : "text-xl"}`}>
          {activeItem?.label ?? "Panel operativo"}
        </h2>
        <p className={`mt-2 leading-5 text-slate-500 dark:text-slate-400 ${fieldMode ? "text-[0.95rem]" : "text-sm"}`}>
          Seguí el flujo operativo sin perderte: panel, planes, mapa, documentos y revisión.
        </p>
        {fieldMode && (
          <p className="mt-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs font-medium text-accent-strong dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100">
            Modo campo activo: controles más grandes y navegación más simple.
          </p>
        )}
      </div>

      <div className="mb-6 space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent dark:text-cyan-300">
          AeroFlow
        </p>
        <h2 className="font-heading text-xl font-semibold text-slate-900 dark:text-white">
          Espacio operacional
        </h2>
        <p className="text-sm leading-5 text-slate-500 dark:text-slate-400">
          Empezá por Panel operativo o Planes de vuelo para abrir el mapa, la documentación y los permisos.
        </p>
      </div>
      <NavLinks pathname={pathname} onClick={onClick} fieldMode={fieldMode} />

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
        </div>
      )}
    </>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fieldMode, setFieldMode] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FIELD_MODE_STORAGE_KEY);
      setFieldMode(stored === "true");
    } catch {
      setFieldMode(false);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(FIELD_MODE_STORAGE_KEY, String(fieldMode));
    } catch {
      // ignore storage errors
    }
  }, [fieldMode]);

  return (
    <div
      className={`min-h-screen bg-transparent text-slate-900 dark:text-slate-100 ${fieldMode ? "[--page-shell-gap:1rem]" : "[--page-shell-gap:1.5rem]"}`}
      data-field-mode={fieldMode ? "true" : "false"}
    >
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className={`sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden ${fieldMode ? "shadow-sm" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
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
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {getActiveNavItem(pathname)?.label ?? "Panel operativo"}
            </p>
          </div>
          <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFieldMode((current) => !current)}
                aria-pressed={fieldMode}
                className={getFieldModeToggleClass(fieldMode)}
              >
                {fieldMode ? "Salir campo" : "Modo campo"}
              </button>
              <NotificationPanel />
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            Modo campo agranda controles y simplifica la navegación para usar la app en terreno.
          </p>
        </div>

      {/* ── Mobile nav overlay ─────────────────────────── */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 dark:bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 ${fieldMode ? "p-6" : "p-5"} shadow-lg dark:shadow-2xl dark:shadow-cyan-950/10 backdrop-blur transition-transform duration-300 lg:hidden ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} onClick={() => setMobileNavOpen(false)} fieldMode={fieldMode} />
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <div className={`mx-auto flex min-h-screen w-full max-w-[1600px] gap-[var(--page-shell-gap)] px-4 py-6 sm:px-6 lg:px-8 ${fieldMode ? "lg:px-6" : ""}`}>
        {/* Desktop sidebar (always visible) */}
        <aside className={`hidden shrink-0 lg:block ${fieldMode ? "w-72" : "w-64"}`}>
          <div className={`rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 ${fieldMode ? "p-6" : "p-5"} shadow-sm dark:shadow-2xl dark:shadow-cyan-950/10 lg:sticky lg:top-6`}>
            <SidebarContent pathname={pathname} fieldMode={fieldMode} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-4 hidden items-center justify-end lg:flex">
            <div className="flex items-center gap-3">
              <div className="hidden text-right xl:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Uso en terreno
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Activalo para ver controles más grandes y menos ruido visual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFieldMode((current) => !current)}
                aria-pressed={fieldMode}
                className={getFieldModeToggleClass(fieldMode)}
              >
                {fieldMode ? "Salir campo" : "Modo campo"}
              </button>
              <NotificationPanel />
            </div>
          </div>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      {!fieldMode && <FlowGuide />}
    </div>
  );
}

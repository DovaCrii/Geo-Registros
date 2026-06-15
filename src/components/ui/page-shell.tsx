"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { FlowGuide } from "@/modules/flow-guide/flow-guide";
import { NotificationPanel } from "@/modules/notifications/notification-panel";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cost-centers", label: "Cost centers" },
  { href: "/clients", label: "Clients" },
  { href: "/drones", label: "Drones" },
  { href: "/operators", label: "Operators" },
  { href: "/flight-plans", label: "Flight plans" },
];

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className="flex items-center rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-200"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="flex items-center gap-2 rounded-2xl border border-slate-700/80 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            <span className="text-lg">{mobileNavOpen ? "✕" : "☰"}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</span>
          </button>
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
        className={`fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/95 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur transition-transform duration-300 lg:static lg:block lg:translate-x-0 lg:rounded-3xl lg:border lg:bg-slate-950/55 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</p>
          <h1 className="text-2xl font-semibold text-white">Operational workspace</h1>
          <p className="text-sm leading-6 text-slate-400">
            Master data foundation for flight operations, documents, and geospatial workflows.
          </p>
        </div>

        <NavLinks onClick={() => setMobileNavOpen(false)} />
      </aside>

      {/* ── Main content ───────────────────────────────── */}
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Desktop sidebar (always visible) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <div className="mb-8 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</p>
              <h1 className="text-2xl font-semibold text-white">Operational workspace</h1>
              <p className="text-sm leading-6 text-slate-400">
                Master data foundation for flight operations, documents, and geospatial workflows.
              </p>
            </div>
            <NavLinks />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Top bar: notification bell (desktop only, mobile is in top bar) */}
          <div className="mb-4 hidden items-center justify-end lg:flex">
            <NotificationPanel />
          </div>
          {children}
        </main>
      </div>
      <FlowGuide />
    </div>
  );
}

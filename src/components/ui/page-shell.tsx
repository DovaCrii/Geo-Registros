import Link from "next/link";
import { ReactNode } from "react";

const navigationItems = [
  { href: "/cost-centers", label: "Cost centers" },
  { href: "/clients", label: "Clients" },
  { href: "/drones", label: "Drones" },
  { href: "/operators", label: "Operators" },
  { href: "/flight-plans", label: "Flight plans" },
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-slate-800/80 bg-slate-950/55 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur lg:block">
          <div className="mb-8 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">AeroFlow</p>
            <h1 className="text-2xl font-semibold text-white">Operational workspace</h1>
            <p className="text-sm leading-6 text-slate-400">
              Master data foundation for flight operations, documents, and geospatial workflows.
            </p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-500/5 hover:text-cyan-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

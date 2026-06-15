import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusChip } from "@/components/ui/status-chip";

const modules = [
  {
    href: "/cost-centers",
    title: "Cost centers",
    description: "Anchor operational ownership and future document routing.",
  },
  {
    href: "/clients",
    title: "Clients",
    description: "Track mandantes and submission-facing counterparts.",
  },
  {
    href: "/drones",
    title: "Drones",
    description: "Prepare RPA inventory for assignments and compliance status.",
  },
  {
    href: "/operators",
    title: "Operators",
    description: "Capture personnel who will later connect to permits and missions.",
  },
];

export default function HomePage() {
  return (
    <PageShell>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Block 2 / Visual base</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white">AeroFlow</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                Drone & RPA flight operations platform — mission planning, interactive mapping, permission workflows, document tracking, and operational history in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusChip label="Foundation verified" tone="success" />
              <StatusChip label="Block 2 in progress" tone="info" />
              <PrimaryButton>Prepare CRUD implementation</PrimaryButton>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-5 shadow-xl shadow-slate-950/10 transition hover:border-cyan-500/30 hover:bg-slate-900/70"
            >
              <div className="space-y-3">
                <StatusChip label="Ready for visual review" tone="info" />
                <h2 className="text-lg font-semibold text-white">{module.title}</h2>
                <p className="text-sm leading-6 text-slate-400">{module.description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </PageShell>
  );
}

import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { StatusChip } from "@/components/ui/status-chip";
import { requirePageAuth } from "@/lib/require-page-auth";
import { getMasterDataSummary } from "@/server/master-data/queries";
import { type EntityCard, EntityCardView } from "./entity-card-view";

export const dynamic = "force-dynamic";

export default async function MasterDataPage() {
  await requirePageAuth("/master-data");

  let summary: Awaited<ReturnType<typeof getMasterDataSummary>> | null = null;
  let error: string | null = null;

  try {
    summary = await getMasterDataSummary();
  } catch {
    error = "No se pudieron cargar los datos maestros. Verificá la conexión a la base de datos.";
  }

  const entities: EntityCard[] = [
    {
      slug: "cost-centers",
      label: "Grupos de trabajo",
      href: "/cost-centers",
      createHref: "/cost-centers/new",
      icon: "📊",
      ...(summary?.costCenters ?? { total: 0, active: 0, inactive: 0 }),
    },
    {
      slug: "clients",
      label: "Clientes",
      href: "/clients",
      createHref: "/clients/new",
      icon: "🤝",
      ...(summary?.clients ?? { total: 0, active: 0, inactive: 0 }),
    },
    {
      slug: "drones",
      label: "Flota RPAS",
      href: "/drones",
      createHref: "/drones/new",
      icon: "🛸",
      ...(summary?.drones ?? { total: 0, active: 0, inactive: 0 }),
    },
    {
      slug: "operators",
      label: "Operadores RPA",
      href: "/operators",
      createHref: "/operators/new",
      icon: "👨‍✈️",
      ...(summary?.operators ?? { total: 0, active: 0, inactive: 0 }),
    },
  ];

  const totalRecords = entities.reduce((acc, e) => acc + (summary ? e.total : 0), 0);

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Datos maestros" }]} />

        <PageHeader
          eyebrow="Bloque 2 / Datos maestros"
          title="Datos maestros"
          description="Vista consolidada de las entidades base del sistema: grupos de trabajo, clientes, flota y operadores."
        />

        {error ? (
          <DetailPanel title="Error" description={error}>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recargá la página e intentá de nuevo.
            </p>
          </DetailPanel>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 dark:border-slate-800/80 dark:bg-slate-950/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-white">{totalRecords}</strong> registros
                en total
              </span>
              <span className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
              <div className="flex flex-wrap gap-2">
                {entities.map((e) => (
                  <StatusChip
                    key={e.slug}
                    label={`${e.label}: ${e.active} activos`}
                    tone={e.active > 0 ? "success" : "neutral"}
                  />
                ))}
              </div>
            </div>

            {/* Entity cards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {entities.map((entity) => (
                <EntityCardView key={entity.slug} entity={entity} />
              ))}
            </div>

            {/* Quick reference panel */}
            <DetailPanel
              title="Acerca de datos maestros"
              description="Entidades base que alimentan los planes de vuelo y permisos DGAC."
            >
              <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                <p>
                  Los <strong className="text-slate-900 dark:text-white">grupos de trabajo</strong>{" "}
                  organizan las operaciones por centro de costo y agrupan drones, operadores y
                  planes de vuelo.
                </p>
                <p>
                  Los <strong className="text-slate-900 dark:text-white">clientes</strong> son los
                  mandantes de las operaciones. Cada plan de vuelo se vincula a un cliente.
                </p>
                <p>
                  La <strong className="text-slate-900 dark:text-white">flota RPAS</strong> registra
                  los drones disponibles con su modelo, número de serie y estado de seguro.
                </p>
                <p>
                  Los <strong className="text-slate-900 dark:text-white">operadores RPA</strong> son
                  los pilotos responsables de ejecutar los vuelos, con licencia y certificaciones.
                </p>
              </div>
            </DetailPanel>
          </>
        )}
      </div>
    </PageShell>
  );
}

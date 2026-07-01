import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DetailPanel } from "@/components/ui/detail-panel";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { GlobalMapWrapper } from "@/modules/flight-plans/global-map-wrapper";

export const dynamic = "force-dynamic";

export default async function OperationsMapPage() {
  await requirePageAuth("/operations/map");

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Operaciones", href: "/dashboard" },
            { label: "Mapa global" },
          ]}
        />

        <PageHeader
          eyebrow="Bloque 1 / Operación principal"
          title="Mapa global de operaciones"
          description="Vista unificada de todos los planes de vuelo con geometría cargada, coloreados por estado del permiso."
        />

        <DetailPanel title="Mapa operativo" description="Hacé clic en cada operación para ver sus datos y acceder al detalle.">
          <GlobalMapWrapper />
        </DetailPanel>
      </div>
    </PageShell>
  );
}

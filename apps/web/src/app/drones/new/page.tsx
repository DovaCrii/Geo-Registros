import { RecordStatus } from "@prisma/client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { DroneForm } from "@/modules/drones/drone-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { createDrone } from "@/server/drones/actions";

export const dynamic = "force-dynamic";

export default async function NewDronePage() {
  await requirePageAuth("/drones/new");

  const costCenterOptions = await listActiveCostCenters().catch(() => []);

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Flota RPAS", href: "/drones" },
            { label: "Registrar dron" },
          ]}
        />

        <PageHeader
          eyebrow="Bloque 2 / Datos maestros"
          title="Registrar dron"
          description="Agregá una nueva aeronave no tripulada al inventario de flota."
        />

        <DroneForm
          title="Nuevo dron"
          description="Completá los datos de identidad, fabricante, modelo y grupo de trabajo opcional."
          action={createDrone}
          submitLabel="Registrar dron"
          costCenterOptions={costCenterOptions}
          initialValues={{
            code: "",
            serialNumber: "",
            manufacturer: "",
            model: "",
            insuranceExpiry: "",
            notes: "",
            costCenterId: "",
            status: RecordStatus.ACTIVE,
          }}
        />
      </div>
    </PageShell>
  );
}

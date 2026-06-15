import { RecordStatus } from "@prisma/client";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { DroneForm } from "@/modules/drones/drone-form";
import { listActiveCostCenters } from "@/server/cost-centers/queries";
import { createDrone } from "@/server/drones/actions";

export const dynamic = "force-dynamic";

export default async function NewDronePage() {
  const costCenterOptions = await listActiveCostCenters().catch(() => []);

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Block 2 / Drones"
          title="Register drone"
          description="Create the first real aircraft inventory slice without prematurely binding a drone to an operator."
        />

        <DroneForm
          title="Drone form"
          description="Keep this slice stable: identity, manufacturer, model, optional cost center assignment, and status."
          action={createDrone}
          submitLabel="Create drone"
          costCenterOptions={costCenterOptions}
          initialValues={{
            code: "",
            serialNumber: "",
            manufacturer: "",
            model: "",
            notes: "",
            costCenterId: "",
            status: RecordStatus.ACTIVE,
          }}
        />
      </div>
    </PageShell>
  );
}

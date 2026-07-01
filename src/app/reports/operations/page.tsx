import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { getDashboardStats } from "@/server/dashboard/queries";
import { OperationsReport } from "@/modules/reports/operations-report";

export const dynamic = "force-dynamic";

export default async function OperationsReportPage() {
  await requirePageAuth("/reports/operations");
  const stats = await getDashboardStats();

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Reportes" },
            { label: "Reporte operacional" },
          ]}
        />

        <PageHeader
          eyebrow="Reportes"
          title="Reporte operacional"
          description="Resumen de la operación actual, distribución de planes de vuelo y próximos vencimientos."
        />

        <OperationsReport stats={stats} />
      </div>
    </PageShell>
  );
}

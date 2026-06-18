import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusChip } from "@/components/ui/status-chip";
import { MasterDataModuleConfig, MasterDataRow } from "@/modules/master-data/catalog";

const columns: Array<DataColumn<MasterDataRow>> = [
  {
    key: "code",
    header: "Código",
    render: (row) => <span className="font-medium text-white">{row.code}</span>,
  },
  {
    key: "name",
    header: "Registro",
    render: (row) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{row.name}</p>
        <p className="text-xs text-slate-500">{row.note}</p>
      </div>
    ),
  },
  {
    key: "owner",
    header: "Responsable operativo",
    render: (row) => <span className="text-slate-300">{row.owner}</span>,
  },
  {
    key: "status",
    header: "Estado",
    render: (row) => <StatusChip label={row.status} tone={row.tone} />,
  },
];

export function MasterDataPage({ config }: { config: MasterDataModuleConfig }) {
  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          actions={<PrimaryButton>Crear registro</PrimaryButton>}
        />

        <FilterBar>
          <FilterField label="Buscar" placeholder={config.searchPlaceholder} />
          <FilterField label={config.filterLabel} placeholder="Filtrar por alcance" />
          <FilterField label={config.ownerLabel} placeholder="Filtrar por responsable" />
          <FilterField label="Estado" placeholder="Filtrar por estado" />
        </FilterBar>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <DataTable
            title={config.title}
            description="Base visual solamente. El CRUD real, persistencia y edición en panel lateral llegan en el próximo slice de implementación."
            columns={columns}
            rows={config.rows}
          />

          <DetailPanel title={config.panelTitle} description={config.panelDescription}>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-sm font-medium text-cyan-200">Operational form zone</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This panel is reserved for creation and editing once Block 2 connects domain models and actions.
              </p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Readiness</span>
                <StatusChip label="Visual base ready" tone="info" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Backend CRUD</span>
                <StatusChip label="Pending" tone="warning" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Map integration</span>
                <StatusChip label="Deferred" tone="neutral" />
              </div>
            </div>
          </DetailPanel>
        </div>
      </div>
    </PageShell>
  );
}

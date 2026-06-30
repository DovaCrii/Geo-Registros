"use client";

import type { ListColumn, ListConfig } from "@/lib/list-config/types";
import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { DraggableTable } from "@/components/ui/draggable-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { SelectableTable } from "@/components/ui/selectable-table";
import { SelectFilter } from "@/components/ui/select-filter";
import { StatusChip } from "@/components/ui/status-chip";
import type { HeaderAction, SidebarConfig } from "@/lib/list-config/types";

function buildDataTableColumns<Row>(columns: ListColumn<Row>[]): Array<DataColumn<Row>> {
  return columns.map((col) => ({
    key: col.key,
    header: col.header,
    sortable: col.sortable,
    sortField: col.sortField,
    render: col.render ?? ((row: Row) => {
      const val = (row as Record<string, unknown>)[col.key];
      return val != null ? String(val) : "—";
    }),
  }));
}

function renderFilters(filters: NonNullable<ListConfig<unknown>["filters"]>) {
  return filters.map((filter) => {
    switch (filter.type) {
      case "search":
        return <SearchInput key={filter.field} paramName={filter.field} placeholder={filter.placeholder} />;
      case "status":
        return (
          <SelectFilter
            key={filter.field}
            label={filter.label}
            paramName={filter.field}
            placeholder={filter.placeholder ?? "Todos los estados"}
            options={[
              { value: "ACTIVE", label: "Activo" },
              { value: "INACTIVE", label: "Inactivo" },
            ]}
          />
        );
      case "select":
        return (
          <SelectFilter
            key={filter.field}
            label={filter.label}
            paramName={filter.field}
            placeholder={filter.placeholder ?? "Todos"}
            options={filter.options ?? []}
          />
        );
      default:
        return null;
    }
  });
}

function renderActions(actions: HeaderAction[] | undefined) {
  if (!actions || actions.length === 0) return undefined;
  return actions.map((action) => {
    const base = "inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition";
    const primary = "border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 text-accent-strong dark:text-cyan-100 hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20";
    const secondary = "border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800";
    return (
      <a key={action.href} href={action.href} className={`${base} ${action.variant === "secondary" ? secondary : primary}`}>
        {action.label}
      </a>
    );
  });
}

function renderSidebar(sidebar: SidebarConfig, total: number) {
  return (
    <DetailPanel title={sidebar.title} description={sidebar.description}>
      {sidebar.items && sidebar.items.length > 0 && (
        <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 p-4">
          {sidebar.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
              <StatusChip label={item.value} tone={item.tone ?? "neutral"} />
            </div>
          ))}
        </div>
      )}

      {sidebar.action && (
        <a
          href={sidebar.action.href}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          {sidebar.action.label}
        </a>
      )}
    </DetailPanel>
  );
}

function renderListTable<Row extends { id: string }>(
  config: ListConfig<Row>,
  rows: Row[],
  desc: string,
  columns: Array<DataColumn<Row>>,
  batchHandlers?: Record<string, (ids: string[]) => Promise<void>>,
) {
  if (config.batchActions && batchHandlers) {
    return (
      <SelectableTable
        title={config.title}
        description={desc}
        columns={columns}
        rows={rows}
        batchActions={config.batchActions}
        batchHandlers={batchHandlers}
        reorderKey={config.reorderKey}
      />
    );
  }

  if (config.reorderKey) {
    return (
      <DraggableTable
        title={config.title}
        description={desc}
        columns={columns}
        rows={rows}
        reorderKey={config.reorderKey}
      />
    );
  }

  return <DataTable title={config.title} description={desc} columns={columns} rows={rows} />;
}

type ListPageClientProps<Row extends { id: string }> = {
  /** Entity list config object (imported on the client side so render fns work). */
  config: ListConfig<Row>;
  /** Pre-fetched rows (serializable). */
  rows: Row[];
  /** Total record count. */
  total: number;
  /** Current search params (URL) for filter/pagination state. */
  searchParams: Record<string, string | undefined>;
  /** Server-action handlers keyed by batch action handler name. */
  batchHandlers?: Record<string, (ids: string[]) => Promise<void>>;
  /** Set false when a route layout already provides PageShell. */
  withShell?: boolean;
};

/**
 * Client-side list page renderer.
 * Imports config on the client side so column render functions work correctly.
 */
export function ListPageClient<Row extends { id: string }>({
  config,
  rows,
  total,
  searchParams,
  batchHandlers,
  withShell = true,
}: ListPageClientProps<Row>) {
  const columns = buildDataTableColumns(config.columns);
  const page = Number(searchParams.page) || 1;
  const defaultPageSize = config.pageSize ?? 10;
  const hasRows = rows.length > 0;
  const desc = hasRows ? `Mostrando ${rows.length} de ${total} registros.` : "No hay registros todavía.";
  const primaryHeaderAction = config.headerActions?.[0];

  const content = (
    <div className="space-y-6">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          actions={renderActions(config.headerActions)}
        />

        {config.filters && config.filters.length > 0 && (
          <FilterBar>{renderFilters(config.filters)}</FilterBar>
        )}

        {hasRows ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            {renderListTable(config, rows, desc, columns, batchHandlers)}

            {config.sidebar
              ? renderSidebar(config.sidebar, total)
              : (
                <DetailPanel title="Listado" description="Vista de lista configurable.">
                  <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total de registros</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{total}</span>
                    </div>
                  </div>
                </DetailPanel>
              )}
          </div>
        ) : (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M9 17v-2m3 2v-4m3 4v-6M5 10l7-7 7 7M5 19h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="No hay registros todavía"
            description="Aún no se ha creado ningún registro en esta sección. Una vez que haya datos, aparecerán aquí."
            action={primaryHeaderAction ? { label: primaryHeaderAction.label, href: primaryHeaderAction.href } : undefined}
            secondaryAction={{ label: "Volver al panel operativo", href: "/dashboard" }}
            steps={[
              { number: 1, label: "Completá los datos maestros", description: "Asegurate de tener grupos de trabajo, clientes, drones y operadores activos." },
              { number: 2, label: "Usá el formulario de creación", description: "Completá los datos del registro y guardalo." },
              { number: 3, label: "Administrá desde esta vista", description: "Buscá, filtrá y gestioná todos tus registros desde un solo lugar." },
            ]}
          />
        )}

        <Pagination total={total} page={page} pageSize={defaultPageSize} />
      </div>
  );

  return withShell ? <PageShell>{content}</PageShell> : content;
}

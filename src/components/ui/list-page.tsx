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
import type { HeaderAction, ListColumn, ListConfig, ListQueryParams, SidebarConfig } from "@/lib/list-config/types";

type FetchResult<Row> = {
  rows: Row[];
  total: number;
};

type ListPageProps<Row extends { id: string }> = {
  config: ListConfig<Row>;
  fetchData: (params: ListQueryParams) => Promise<FetchResult<Row>>;
  searchParams: Record<string, string | undefined>;
  /** Server-action handlers keyed by the handler name defined in batchActions config. */
  batchHandlers?: Record<string, (ids: string[]) => Promise<void>>;
};

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
    const secondary = "border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800";
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
        <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/70 p-4">
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
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          {sidebar.action.label}
        </a>
      )}
    </DetailPanel>
  );
}

/**
 * Generic list page that composes PageHeader, FilterBar, DataTable,
 * Pagination, and config-driven sidebar.
 *
 * All filter state lives in URL search params. The page re-renders on
 * the server when params change (RSC + dynamic rendering).
 */
export async function ListPage<Row extends { id: string }>({
  config,
  fetchData,
  searchParams,
  batchHandlers,
}: ListPageProps<Row>) {
  const page = Number(searchParams.page) || 1;

  const params: ListQueryParams = {
    search: searchParams.q || searchParams.search,
    page,
    pageSize: config.pageSize ?? 10,
    sortField: searchParams.sort,
    sortDir: (searchParams.dir as "asc" | "desc") ?? undefined,
  };

  // Pass filter params through for queries that accept them
  for (const filter of config.filters ?? []) {
    if (filter.type !== "search") {
      params[filter.field] = searchParams[filter.field];
    }
  }

  const { rows, total } = await fetchData(params);

  const columns = buildDataTableColumns(config.columns);
  const defaultPageSize = config.pageSize ?? 10;
  const desc =
    rows.length > 0
      ? `Mostrando ${rows.length} de ${total} registros.`
      : "No hay registros todavía.";

  return (
    <PageShell>
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

        {rows.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M9 17v-2m3 2v-4m3 4v-6M5 10l7-7 7 7M5 19h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="No hay registros todavía"
            description="Aún no se ha creado ningún registro en esta sección. Una vez que haya datos, aparecerán aquí."
            action={config.headerActions?.[0] ? { label: config.headerActions[0].label, href: config.headerActions[0].href } : undefined}
            steps={[
              { number: 1, label: "Completá los datos maestros", description: "Asegurate de tener grupos de trabajo, clientes, drones y operadores activos." },
              { number: 2, label: "Usá el formulario de creación", description: "Completá los datos del registro y guardalo." },
              { number: 3, label: "Administrá desde esta vista", description: "Buscá, filtrá y gestioná todos tus registros desde un solo lugar." },
            ]}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
            {config.batchActions && batchHandlers ? (
              <SelectableTable
                title={config.title}
                description={desc}
                columns={columns}
                rows={rows}
                batchActions={config.batchActions}
                batchHandlers={batchHandlers}
                reorderKey={config.reorderKey}
              />
            ) : config.reorderKey ? (
              <DraggableTable
                title={config.title}
                description={desc}
                columns={columns}
                rows={rows}
                reorderKey={config.reorderKey}
              />
            ) : (
              <DataTable
                title={config.title}
                description={desc}
                columns={columns}
                rows={rows}
              />
            )}

            {config.sidebar
              ? renderSidebar(config.sidebar, total)
              : (
                <DetailPanel title="Listado" description="Vista de lista configurable.">
                  <div className="space-y-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total de registros</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-white">{total}</span>
                    </div>
                  </div>
                </DetailPanel>
              )}
          </div>
        )}

        <Pagination total={total} page={page} pageSize={defaultPageSize} />
      </div>
    </PageShell>
  );
}

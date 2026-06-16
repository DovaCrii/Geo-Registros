import { ReactNode } from "react";

import { DataColumn, DataTable } from "@/components/ui/data-table";
import { DetailPanel } from "@/components/ui/detail-panel";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { SelectFilter } from "@/components/ui/select-filter";
import { StatusChip } from "@/components/ui/status-chip";
import type { ListColumn, ListConfig, ListQueryParams, SidebarConfig } from "@/lib/list-config/types";

type FetchResult<Row> = {
  rows: Row[];
  total: number;
};

type ListPageProps<Row> = {
  config: ListConfig<Row>;
  fetchData: (params: ListQueryParams) => Promise<FetchResult<Row>>;
  searchParams: Record<string, string | undefined>;
  headerActions?: ReactNode;
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
            placeholder={filter.placeholder ?? "All statuses"}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        );
      case "select":
        return (
          <SelectFilter
            key={filter.field}
            label={filter.label}
            paramName={filter.field}
            placeholder={filter.placeholder ?? "All"}
            options={filter.options ?? []}
          />
        );
      default:
        return null;
    }
  });
}

function renderSidebar(sidebar: SidebarConfig, total: number) {
  return (
    <DetailPanel title={sidebar.title} description={sidebar.description}>
      {sidebar.items && sidebar.items.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
          {sidebar.items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <StatusChip label={item.value} tone={item.tone ?? "neutral"} />
            </div>
          ))}
        </div>
      )}

      {sidebar.action && (
        <a
          href={sidebar.action.href}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
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
export async function ListPage<Row>({
  config,
  fetchData,
  searchParams,
  headerActions,
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

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          actions={
            headerActions ??
            (config.actions?.create ? (
              <a
                href={config.actions.create.href}
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
              >
                {config.actions.create.label}
              </a>
            ) : undefined)
          }
        />

        {config.filters && config.filters.length > 0 && (
          <FilterBar>{renderFilters(config.filters)}</FilterBar>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <DataTable
            title={config.title}
            description={
              rows.length > 0
                ? `Showing ${rows.length} of ${total} records.`
                : "No records found."
            }
            columns={columns}
            rows={rows}
          />

          {config.sidebar
            ? renderSidebar(config.sidebar, total)
            : (
              <DetailPanel title="List" description="Configurable list view.">
                <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Total records</span>
                    <span className="text-sm font-medium text-white">{total}</span>
                  </div>
                </div>
              </DetailPanel>
            )}
        </div>

        <Pagination total={total} page={page} pageSize={defaultPageSize} />
      </div>
    </PageShell>
  );
}

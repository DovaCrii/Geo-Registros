import type { ReactNode } from "react";

/** A single column definition for a configurable list page. */
export interface ListColumn<Row> {
  /** Unique key matching the data field or used as React key. */
  key: string;
  /** Column header text. */
  header: string;
  /** Optional custom renderer. Falls back to row[key]?.toString(). */
  render?: (row: Row) => ReactNode;
  /** Enable sorting by this column. */
  sortable?: boolean;
  /** Prisma field name for sorting (defaults to key). */
  sortField?: string;
  /** Hide on small screens. */
  hideOnMobile?: boolean;
}

/** A filter control definition. */
export interface ListFilter {
  /** URL param name and query field key. */
  field: string;
  /** Label shown above the control. */
  label: string;
  /** Control type. */
  type: "search" | "status" | "select";
  /** For select filters: static or dynamic option source key. */
  options?: Array<{ value: string; label: string }>;
  /** Placeholder text. */
  placeholder?: string;
}

/** A sidebar status item. */
export interface SidebarItem {
  label: string;
  value: string;
  tone?: "success" | "info" | "warning" | "neutral" | "danger";
}

/** Sidebar configuration for the right panel. */
export interface SidebarConfig {
  title: string;
  description: string;
  items?: SidebarItem[];
  action?: {
    href: string;
    label: string;
  };
}

/** A header action button rendered in the page header area. */
export interface HeaderAction {
  /** Link href. */
  href: string;
  /** Button label. */
  label: string;
  /** Visual variant. Defaults to "primary". */
  variant?: "primary" | "secondary";
}

/** A batch action available when rows are selected. */
export interface BatchAction {
  /** Button label. */
  label: string;
  /** Visual variant. Defaults to "primary". */
  variant?: "primary" | "danger" | "warning";
  /** Handler key used to look up the server action in batchHandlers. */
  handler: string;
}

/** Configuration for a generic list page. */
export interface ListConfig<Row> {
  /** Page eyebrow / breadcrumb. */
  eyebrow: string;
  /** Page title. */
  title: string;
  /** Page description. */
  description: string;
  /** Column definitions. */
  columns: ListColumn<Row>[];
  /** Filter definitions (rendered inside FilterBar). */
  filters?: ListFilter[];
  /** Header action buttons (e.g. create). */
  headerActions?: HeaderAction[];
  /** Batch actions available when rows are selected. */
  batchActions?: BatchAction[];
  /** When set, columns can be reordered via drag & drop and persisted in localStorage. */
  reorderKey?: string;
  /** Sidebar configuration (right panel). */
  sidebar?: SidebarConfig;
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Number of rows per page. Default 10. */
  pageSize?: number;
}

/** Standardised filter params passed to every query function. */
export interface ListQueryParams {
  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  /** Field to sort by (column key). */
  sortField?: string;
  /** Sort direction. */
  sortDir?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

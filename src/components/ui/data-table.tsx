import { ReactNode } from "react";

import { SortHeader } from "@/components/ui/sort-header";

export type DataColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  /** Enable sorting by this column. */
  sortable?: boolean;
  /** Field key for sorting (defaults to key). */
  sortField?: string;
};

export function DataTable<Row>({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: Array<DataColumn<Row>>;
  rows: Row[];
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <div className="border-b border-slate-200 dark:border-slate-800/80 px-6 py-5">
        <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/80 text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left"
                >
                  {column.sortable ? (
                    <SortHeader field={column.sortField ?? column.key} label={column.header} />
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {column.header}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-slate-50 dark:hover:bg-slate-900/55">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 align-middle text-slate-700 dark:text-slate-200">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

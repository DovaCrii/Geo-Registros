import { ReactNode } from "react";

export type DataColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
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
    <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/45 shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="border-b border-slate-800/80 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/80 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {rows.map((row, index) => (
              <tr key={index} className="transition hover:bg-slate-900/55">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 align-middle text-slate-200">
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

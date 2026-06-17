"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SortHeader } from "@/components/ui/sort-header";
import type { DataColumn } from "@/components/ui/data-table";

function storageKey(reorderKey: string) {
  return `aeroflow:column-order:${reorderKey}`;
}

function loadOrder(reorderKey: string, defaultKeys: string[]): string[] {
  try {
    const saved = localStorage.getItem(storageKey(reorderKey));
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      // only keep keys that still exist in the config
      const valid = parsed.filter((k) => defaultKeys.includes(k));
      // append any new keys not yet saved
      for (const k of defaultKeys) {
        if (!valid.includes(k)) valid.push(k);
      }
      return valid;
    }
  } catch {
    // ignore corrupt data
  }
  return defaultKeys;
}

type DraggableTableProps<Row> = {
  title: string;
  description: string;
  columns: Array<DataColumn<Row>>;
  rows: Row[];
  reorderKey?: string;
};

/**
 * Client-side table with optional drag-and-drop column reordering.
 *
 * When `reorderKey` is provided, column order is persisted in localStorage
 * keyed by `aeroflow:column-order:${reorderKey}`.
 * Without `reorderKey`, renders as a plain table (no drag).
 */
export function DraggableTable<Row>({
  title,
  description,
  columns,
  rows,
  reorderKey,
}: DraggableTableProps<Row>) {
  const defaultKeys = columns.map((c) => c.key);
  const [columnKeys, setColumnKeys] = useState<string[]>(() =>
    reorderKey ? loadOrder(reorderKey, defaultKeys) : defaultKeys,
  );
  const dragIndex = useRef<number | null>(null);

  // Sync when config columns change (e.g. hot reload)
  useEffect(() => {
    if (!reorderKey) return;
    setColumnKeys((prev) => {
      const valid = prev.filter((k) => defaultKeys.includes(k));
      let changed = false;
      for (const k of defaultKeys) {
        if (!valid.includes(k)) {
          valid.push(k);
          changed = true;
        }
      }
      return changed ? valid : prev;
    });
  }, [defaultKeys.join(","), reorderKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderedColumns = columnKeys
    .map((key) => columns.find((c) => c.key === key))
    .filter(Boolean) as Array<DataColumn<Row>>;

  const persist = useCallback(
    (keys: string[]) => {
      if (!reorderKey) return;
      try {
        localStorage.setItem(storageKey(reorderKey), JSON.stringify(keys));
      } catch {
        // storage full or unavailable
      }
    },
    [reorderKey],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLButtonElement>, index: number) => {
      dragIndex.current = index;
      e.dataTransfer.effectAllowed = "move";
      // required for Firefox
      e.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>, dropIdx: number) => {
      e.preventDefault();
      const from = dragIndex.current;
      if (from === null || from === dropIdx) return;

      setColumnKeys((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(dropIdx, 0, moved);
        persist(next);
        return next;
      });
      dragIndex.current = null;
    },
    [persist],
  );

  const handleDragEnd = useCallback(() => {
    dragIndex.current = null;
  }, []);

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
              {orderedColumns.map((column, idx) => (
                <th key={column.key} className="px-6 py-3 text-left">
                  {column.key === "__select__" ? (
                    <span className="inline-flex items-center">{column.header}</span>
                  ) : reorderKey ? (
                    <button
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className="inline-flex w-full cursor-grab items-center gap-2 text-left active:cursor-grabbing"
                    >
                      <span className="text-slate-400 dark:text-slate-600 transition group-hover:text-slate-500 dark:group-hover:text-slate-400">⠿</span>
                      {column.sortable ? (
                        <SortHeader field={column.sortField ?? column.key} label={column.header} />
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {column.header}
                        </span>
                      )}
                    </button>
                  ) : column.sortable ? (
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
                {orderedColumns.map((column) => (
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

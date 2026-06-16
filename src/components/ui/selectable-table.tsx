"use client";

import { useCallback, useState } from "react";

import { DraggableTable } from "@/components/ui/draggable-table";
import type { DataColumn } from "@/components/ui/data-table";
import { BatchToolbar } from "@/components/ui/batch-toolbar";
import type { BatchAction } from "@/lib/list-config/types";

type SelectableTableProps<Row extends { id: string }> = {
  title: string;
  description: string;
  columns: Array<DataColumn<Row>>;
  rows: Row[];
  batchActions: BatchAction[];
  batchHandlers: Record<string, (ids: string[]) => Promise<void>>;
  reorderKey?: string;
};

/**
 * Wraps DraggableTable with row selection checkboxes and a batch toolbar.
 */
export function SelectableTable<Row extends { id: string }>({
  title,
  description,
  columns,
  rows,
  batchActions,
  batchHandlers,
  reorderKey,
}: SelectableTableProps<Row>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === rows.length) return new Set();
      return new Set(rows.map((r) => r.id));
    });
  }, [rows]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleAction = useCallback(
    async (handler: string) => {
      const fn = batchHandlers[handler];
      if (!fn) return;
      await fn(Array.from(selectedIds));
      clearSelection();
    },
    [selectedIds, batchHandlers, clearSelection],
  );

  // Inject checkbox column at the start
  const checkboxCol: DataColumn<Row> = {
    key: "__select__",
    header: "",
    render: (row: Row) => (
      <input
        type="checkbox"
        checked={selectedIds.has(row.id)}
        onChange={() => toggleId(row.id)}
        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400/40"
      />
    ),
  };

  // Select-all header checkbox
  const selectAllHeader = (
    <input
      type="checkbox"
      checked={rows.length > 0 && selectedIds.size === rows.length}
      onChange={toggleAll}
      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-400/40"
    />
  );

  const allColumns = [
    { ...checkboxCol, header: "", render: () => selectAllHeader } as DataColumn<Row>,
    ...columns,
  ];

  return (
    <div className="space-y-4">
      <BatchToolbar
        selectedCount={selectedIds.size}
        actions={batchActions}
        onAction={handleAction}
        onClear={clearSelection}
      />

      <DraggableTable
        title={title}
        description={description}
        columns={allColumns}
        rows={rows}
        reorderKey={reorderKey}
      />
    </div>
  );
}

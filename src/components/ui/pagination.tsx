"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
};

export function Pagination({ total, page, pageSize }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goTo = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3">
      <p className="text-xs text-slate-500">
        {total} registro{(total !== 1) ? "s" : ""}
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        {renderPageNumbers(page, totalPages, goTo)}

        <button
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function renderPageNumbers(
  current: number,
  total: number,
  goTo: (p: number) => void,
) {
  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return pages.map((p, idx) =>
    p === "..." ? (
      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-600">
        …
      </span>
    ) : (
      <button
        key={p}
        onClick={() => goTo(p)}
        className={`min-w-[28px] rounded-xl px-2 py-1.5 text-xs font-medium transition ${
          p === current
            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
            : "text-slate-400 hover:text-slate-200 border border-transparent"
        }`}
      >
        {p}
      </button>
    ),
  );
}

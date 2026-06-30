"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SortHeaderProps = {
  field: string;
  label: string;
};

/**
 * URL-driven sortable column header.
 * Toggles ASC/DESC on click. Reads/writes `?sort=` and `?dir=` search params.
 */
export function SortHeader({ field, label }: SortHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort");
  const currentDir = searchParams.get("dir");

  const isActive = currentSort === field;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (isActive && currentDir === "desc") {
      // Toggle off: remove sort entirely
      params.delete("sort");
      params.delete("dir");
    } else {
      params.set("sort", field);
      params.set("dir", nextDir);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, field, nextDir, isActive, currentDir]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ordenar por ${label}`}
      aria-pressed={isActive}
      className="group inline-flex items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <span>{label}</span>
      <span className="flex flex-col leading-none opacity-0 transition group-hover:opacity-100" aria-hidden="true">
        <svg className={`h-2 w-2 ${isActive && currentDir === "asc" ? "text-accent dark:text-cyan-300" : "text-slate-400 dark:text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
        <svg className={`h-2 w-2 ${isActive && currentDir === "desc" ? "text-accent dark:text-cyan-300" : "text-slate-400 dark:text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </span>
      {isActive && (
        <span className="text-accent dark:text-cyan-300" aria-hidden="true">
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d={currentDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </span>
      )}
    </button>
  );
}

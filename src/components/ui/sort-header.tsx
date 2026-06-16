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
      onClick={handleClick}
      className="group inline-flex items-center gap-1.5 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-300"
    >
      <span>{label}</span>
      <span className="flex flex-col leading-none opacity-0 transition group-hover:opacity-100">
        <span className={`text-[8px] ${isActive && currentDir === "asc" ? "text-cyan-300" : "text-slate-600"}`}>▲</span>
        <span className={`text-[8px] ${isActive && currentDir === "desc" ? "text-cyan-300" : "text-slate-600"}`}>▼</span>
      </span>
      {isActive && (
        <span className="text-[10px] text-cyan-300">
          {currentDir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </button>
  );
}

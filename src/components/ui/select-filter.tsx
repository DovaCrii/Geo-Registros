"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { uiKicker } from "@/components/ui/design-tokens";

type SelectFilterProps = {
  label: string;
  paramName: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
};

function replaceSearchParam(
  searchParams: ReturnType<typeof useSearchParams>,
  paramName: string,
  value: string,
  router: ReturnType<typeof useRouter>,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("page");
  if (value) {
    params.set(paramName, value);
  } else {
    params.delete(paramName);
  }
  router.replace(`?${params.toString()}`, { scroll: false });
}

/**
 * URL-driven select filter with immediate navigation.
 */
export function SelectFilter({ label, paramName, placeholder = "Todos", options }: SelectFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? "";

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      replaceSearchParam(searchParams, paramName, e.target.value, router);
    },
    [router, searchParams, paramName],
  );

  return (
    <label className="space-y-2">
      <span className={uiKicker}>{label}</span>
      <select
        value={current}
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

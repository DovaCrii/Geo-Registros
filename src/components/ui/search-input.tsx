"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { uiKicker } from "@/components/ui/design-tokens";

type SearchInputProps = {
  placeholder?: string;
  paramName?: string;
};

function replaceSearchParam(
  searchParams: ReturnType<typeof useSearchParams>,
  paramName: string,
  value: string,
  router: ReturnType<typeof useRouter>,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (value) {
    params.set(paramName, value);
  } else {
    params.delete(paramName);
  }
  router.replace(`?${params.toString()}`, { scroll: false });
}

/**
 * URL-driven search input with debounce.
 * Reads/writes `?q=` search param (configurable via paramName).
 */
export function SearchInput({
  placeholder = "Buscar…",
  paramName = "q",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync from URL on external changes (back/forward)
  useEffect(() => {
    const current = searchParams.get(paramName) ?? "";
    setValue(current);
  }, [searchParams, paramName]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setValue(nextValue);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        replaceSearchParam(searchParams, paramName, nextValue, router);
      }, 300);
    },
    [router, searchParams, paramName],
  );

  const handleClear = useCallback(() => {
    setValue("");
    replaceSearchParam(searchParams, paramName, "", router);
  }, [router, searchParams, paramName]);

  return (
    <label className="space-y-2">
      <span className={uiKicker}>Búsqueda</span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 pr-10 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 dark:text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
            aria-label="Limpiar búsqueda"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </label>
  );
}

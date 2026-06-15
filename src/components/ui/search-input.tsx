"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type SearchInputProps = {
  placeholder?: string;
  paramName?: string;
};

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setValue(newVal);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (newVal) {
          params.set(paramName, newVal);
        } else {
          params.delete(paramName);
        }
        router.replace(`?${params.toString()}`, { scroll: false });
      }, 300);
    },
    [router, searchParams, paramName],
  );

  const handleClear = useCallback(() => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, paramName]);

  return (
    <label className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        Búsqueda
      </span>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 pr-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-500 transition hover:text-slate-300"
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

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { DetailPanel } from "@/components/ui/detail-panel";

type SearchResultItem = {
  type: "flight-plan" | "client" | "drone" | "operator";
  label: string;
  href: string;
};

const TYPE_META: Record<string, { label: string }> = {
  "flight-plan": { label: "Planes de vuelo" },
  client: { label: "Clientes" },
  drone: { label: "Flota RPAS" },
  operator: { label: "Operadores" },
};

function SearchResultsContent({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string>("");

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    // Avoid re-fetching same query
    if (fetchedRef.current === query) return;
    fetchedRef.current = query;

    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al buscar");
        return res.json();
      })
      .then((data: { results: SearchResultItem[] }) => {
        setResults(data.results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  if (!query) {
    return (
      <DetailPanel title="Escribí un término" description="Usá el campo de búsqueda para encontrar planes de vuelo, clientes, drones y operadores.">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Escribí al menos un carácter para empezar a buscar en todas las entidades del sistema.
        </p>
      </DetailPanel>
    );
  }

  if (loading) {
    return (
      <DetailPanel title="Buscando…" description="Revisando planes de vuelo, clientes, drones y operadores.">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900/40" />
          ))}
        </div>
      </DetailPanel>
    );
  }

  if (error) {
    return (
      <DetailPanel title="Error al buscar" description="Ocurrió un error al realizar la búsqueda.">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      </DetailPanel>
    );
  }

  const grouped = results.reduce<Record<string, SearchResultItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const hasResults = Object.keys(grouped).length > 0;

  return (
    <div className="space-y-6">
      {hasResults ? (
        Object.entries(grouped).map(([type, items]) => (
          <section key={type}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {TYPE_META[type]?.label ?? type}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                {items.length}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-accent/30 hover:bg-accent/5 dark:border-slate-800/80 dark:bg-slate-950/55 dark:hover:border-cyan-500/30 dark:hover:bg-cyan-500/5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700/80 dark:bg-slate-950/70 dark:text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {type === "flight-plan" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      ) : type === "client" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      ) : type === "drone" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      )}
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {TYPE_META[type]?.label ?? type}
                    </p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        ))
      ) : (
        <DetailPanel title="Sin resultados" description={`No se encontraron resultados para "${query}".`}>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Probá con otros términos o revisá que el término esté bien escrito.
          </p>
        </DetailPanel>
      )}

      <div className="text-xs text-slate-500 dark:text-slate-400">
        {results.length > 0 && `Mostrando ${results.length} resultado${results.length !== 1 ? "s" : ""}.`}
        La búsqueda incluye planes de vuelo, clientes, drones y operadores activos.
      </div>
    </div>
  );
}

export function SearchResults({ query }: { query: string }) {
  return <SearchResultsContent query={query} />;
}

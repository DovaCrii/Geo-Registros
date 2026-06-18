"use client";

import { useState, useMemo } from "react";

import { FlowMap } from "./FlowMap";
import { DocPreview } from "./DocPreview";

type HelpDoc = {
  id: string;
  title: string;
  slug: string;
  category: string;
  fileName: string;
  mimeType: string;
  size: number;
};

const SECTIONS = [
  { title: "Antes del vuelo", items: ["Registro RPA", "Credencial piloto RPAS", "Restricciones del espacio aéreo", "Clima y ventanas operativas"] },
  { title: "Durante la operación", items: ["Seguimiento del plan de vuelo", "Evidencia y bitácora", "Cambios de último momento", "Reportes operativos"] },
  { title: "Después del vuelo", items: ["Cierre operativo", "Respaldo documental", "Entregables técnicos", "Trazabilidad del evento"] },
  { title: "Marco normativo", items: ["DAN 151", "DAN 91", "DAN 119", "DAN 137", "DAN 19", "DAR 51", "Código Aeronáutico"] },
  { title: "Gestión operativa", items: ["AOC / CEO", "SMS", "Manual de Operaciones", "SIGO / NEO / OIRS DGAC"] },
] as const;

type HelpCenterClientProps = {
  docsByCategory: Record<string, HelpDoc[]>;
};

export function HelpCenterClient({ docsByCategory }: HelpCenterClientProps) {
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<HelpDoc | null>(null);

  const allDocs = useMemo(() => Object.values(docsByCategory).flat(), [docsByCategory]);
  const hasDocs = allDocs.length > 0;

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return allDocs;
    const q = search.toLowerCase();
    return allDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q)
    );
  }, [allDocs, search]);

  const filteredByCategory = useMemo(() => {
    const grouped: Record<string, HelpDoc[]> = {};
    for (const doc of filteredDocs) {
      grouped[doc.category] ??= [];
      grouped[doc.category].push(doc);
    }
    return grouped;
  }, [filteredDocs]);

  const hasSearchResults = search.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 p-8 shadow-sm dark:shadow-2xl dark:shadow-cyan-950/10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent dark:text-cyan-300">
          Centro de Conocimiento
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Centro de ayuda operativa
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Material interno de apoyo para operaciones RPAS en Chile. Buscá documentos, explorá el
          flujo operacional y consultá la normativa vigente.
        </p>
        {/* Search bar */}
        <div className="relative mt-6 max-w-xl">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscá documentos, normativa, procedimientos..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-950/80 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
            aria-label="Buscar documentos"
          />
        </div>
      </div>

      {/* Flow map */}
      <FlowMap />

      {/* Normative sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{section.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 px-4 py-3"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-accent dark:bg-cyan-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Checklist banner */}
      <section className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.04] p-6">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">
          Checklist operativo DGAC
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-50/80">
          La checklist vive por plan de vuelo y se sincroniza localmente por navegador. Cada
          misión tiene su propio checklist DGAC.
        </p>
      </section>

      {/* Document library */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Documentación interna
          {hasSearchResults && (
            <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
              ({filteredDocs.length} resultados)
            </span>
          )}
        </h2>

        {!hasDocs && !hasSearchResults ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Todavía no hay documentos cargados.
          </p>
        ) : hasSearchResults && filteredDocs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            No se encontraron documentos para &ldquo;{search}&rdquo;.
          </p>
        ) : (
          <div className="mt-4 space-y-6">
            {Object.entries(filteredByCategory).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent dark:text-cyan-300">
                  {category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/45 p-4 text-left transition hover:border-accent/30 dark:hover:border-cyan-400/40 hover:bg-accent/5 dark:hover:bg-cyan-500/5"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                        {doc.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                        {doc.fileName}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Navigation */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/80 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          Volver al panel
        </a>
        <a
          href="/flight-plans"
          className="inline-flex items-center justify-center rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20"
        >
          Ir a planes de vuelo
        </a>
      </div>

      {/* Preview modal */}
      {selectedDoc && (
        <DocPreview doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}

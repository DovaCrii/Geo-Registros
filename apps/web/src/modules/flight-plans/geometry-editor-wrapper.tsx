"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { GeometryEditor as GeometryEditorType } from "@/modules/flight-plans/geometry-editor";

const LazyGeometryEditor = dynamic(
    () => import("@/modules/flight-plans/geometry-editor").then((m) => m.GeometryEditor),
    {
      ssr: false,
      loading: () => (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-950/10 dark:border-slate-800/80 dark:bg-slate-950/45">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
                Cargando workspace
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Preparando mapa, capas y herramientas de geometría.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
              Espere un momento
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
            <div className="space-y-4">
              <div className="h-[180px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
              <div className="h-[180px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
              <div className="h-[120px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
            </div>
          </div>
        </div>
      ),
  },
);

export function GeometryEditorWrapper(props: ComponentProps<typeof GeometryEditorType>) {
  return <LazyGeometryEditor {...props} />;
}

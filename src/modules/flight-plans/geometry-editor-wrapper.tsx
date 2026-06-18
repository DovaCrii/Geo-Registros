"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { GeometryEditor as GeometryEditorType } from "@/modules/flight-plans/geometry-editor";

const LazyGeometryEditor = dynamic(
    () => import("@/modules/flight-plans/geometry-editor").then((m) => m.GeometryEditor),
    {
      ssr: false,
      loading: () => (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
          <div className="h-[560px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
          <div className="h-[600px] animate-pulse rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45" />
        </div>
      ),
  },
);

export function GeometryEditorWrapper(props: ComponentProps<typeof GeometryEditorType>) {
  return <LazyGeometryEditor {...props} />;
}

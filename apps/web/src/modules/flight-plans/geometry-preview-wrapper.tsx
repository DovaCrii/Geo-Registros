"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { GeometryPreview as GeometryPreviewType } from "@/modules/flight-plans/geometry-preview";

const LazyGeometryPreview = dynamic(
  () => import("@/modules/flight-plans/geometry-preview").then((m) => m.GeometryPreview),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45"
        style={{ height: 200 }}
      />
    ),
  },
);

export function GeometryPreviewWrapper(props: ComponentProps<typeof GeometryPreviewType>) {
  return <LazyGeometryPreview {...props} />;
}

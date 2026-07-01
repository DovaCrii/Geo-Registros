"use client";

import dynamic from "next/dynamic";

const GlobalMapView = dynamic(
  () => import("@/modules/flight-plans/global-map-view").then((m) => m.GlobalMapView),
  { ssr: false },
);

export function GlobalMapWrapper() {
  return <GlobalMapView />;
}

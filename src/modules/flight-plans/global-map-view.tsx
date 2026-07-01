"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** Recursively extract all [lng, lat] coordinates from any GeoJSON geometry. */
function traverseCoords(
  geom: GeoJSON.Geometry | null | undefined,
  visit: (lng: number, lat: number) => void,
): void {
  if (!geom) return;
  switch (geom.type) {
    case "Point":
      visit(geom.coordinates[0], geom.coordinates[1]);
      break;
    case "MultiPoint":
    case "LineString":
      geom.coordinates.forEach(([lng, lat]) => visit(lng, lat));
      break;
    case "MultiLineString":
    case "Polygon":
      geom.coordinates.forEach((ring) => ring.forEach(([lng, lat]) => visit(lng, lat)));
      break;
    case "MultiPolygon":
      geom.coordinates.forEach((poly) =>
        poly.forEach((ring) => ring.forEach(([lng, lat]) => visit(lng, lat))),
      );
      break;
    case "GeometryCollection":
      geom.geometries.forEach((g) => traverseCoords(g, visit));
      break;
  }
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#6b7280",
  IN_REVIEW: "#f59e0b",
  READY_FOR_SUBMISSION: "#f59e0b",
  SUBMITTED: "#3b82f6",
  AUTHORIZED: "#10b981",
  OBSERVED: "#f59e0b",
  REJECTED: "#ef4444",
  EXPIRED: "#6b7280",
  CLOSED: "#10b981",
  CANCELLED: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  READY_FOR_SUBMISSION: "Listo para envío",
  SUBMITTED: "Enviado",
  AUTHORIZED: "Autorizado",
  OBSERVED: "Observado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

type FeatureProperties = {
  id: string;
  code: string;
  title: string;
  operationDate: string;
  status: string;
  costCenter: string;
  client: string;
};

export function GlobalMapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [features, setFeatures] = useState<GeoJSON.Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/operations/map")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar datos del mapa");
        return res.json();
      })
      .then((data: GeoJSON.FeatureCollection) => {
        // Inject statusColor into each feature's properties for map styling
        const enriched = data.features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            statusColor: STATUS_COLORS[f.properties?.status as string] ?? "#6b7280",
          },
        }));
        setFeatures(enriched);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current || features.length === 0 || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      zoom: 4,
      center: [-70, -33],
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("flight-plans", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
      });

      // Point layer (for points and centroids)
      map.addLayer({
        id: "plans-points",
        type: "circle",
        source: "flight-plans",
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 8,
          "circle-color": ["get", "statusColor"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      // Polygon/line layer
      map.addLayer({
        id: "plans-fill",
        type: "fill",
        source: "flight-plans",
        filter: ["any", ["==", "$type", "Polygon"], ["==", "$type", "MultiPolygon"]],
        paint: {
          "fill-color": ["get", "statusColor"],
          "fill-opacity": 0.15,
          "fill-outline-color": ["get", "statusColor"],
        },
      });

      map.addLayer({
        id: "plans-outline",
        type: "line",
        source: "flight-plans",
        filter: ["any", ["==", "$type", "Polygon"], ["==", "$type", "MultiPolygon"]],
        paint: {
          "line-color": ["get", "statusColor"],
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      // Line string layer
      map.addLayer({
        id: "plans-lines",
        type: "line",
        source: "flight-plans",
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": ["get", "statusColor"],
          "line-width": 3,
          "line-opacity": 0.8,
        },
      });

      // Fit bounds to show all features
      setTimeout(() => {
        try {
          const bounds = new maplibregl.LngLatBounds();
          const src = map.getSource("flight-plans") as maplibregl.GeoJSONSource;
          const data = (src as unknown as { _data?: GeoJSON.FeatureCollection })._data;
          if (data?.features) {
            for (const f of data.features) {
              traverseCoords(f.geometry, (lng, lat) => bounds.extend([lng, lat]));
            }
            if (!bounds.isEmpty()) {
              map.fitBounds(bounds, { padding: 60, maxZoom: 12 });
            }
          }
        } catch {
          // bounds fitting is best-effort
        }
      }, 100);

      // Popup on click
      map.on("click", "plans-points", (e) => {
        if (!e.features?.[0]?.properties) return;
        showPopup(map, e);
      });
      map.on("click", "plans-fill", (e) => {
        if (!e.features?.[0]?.properties) return;
        showPopup(map, e);
      });
      map.on("click", "plans-lines", (e) => {
        if (!e.features?.[0]?.properties) return;
        showPopup(map, e);
      });

      // Cursor
      map.on("mouseenter", "plans-points", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "plans-points", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "plans-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "plans-fill", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "plans-lines", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "plans-lines", () => { map.getCanvas().style.cursor = ""; });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Only run when features load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  if (loading) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45">
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando mapa operativo global…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-950/20">
        <p className="text-sm text-rose-700 dark:text-rose-300">Error: {error}</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/45">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay operaciones con geometría cargada todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="h-[560px] w-full rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden" />

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <span key={key} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[key] ?? "#6b7280" }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function showPopup(map: maplibregl.Map, e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) {
  const props = e.features?.[0]?.properties as Record<string, string> | undefined;
  if (!props) return;

  const statusLabel = STATUS_LABELS[props.status] ?? props.status;

  new maplibregl.Popup({ closeButton: true, maxWidth: "300px" })
    .setLngLat(e.lngLat)
    .setHTML(
      `<div class="space-y-1 text-xs">
        <p class="font-semibold text-sm">${props.code}</p>
        <p>${props.title}</p>
        <p>Fecha: ${props.operationDate ?? "—"}</p>
        <p>Estado: ${statusLabel}</p>
        <p>Cliente: ${props.client ?? "—"}</p>
        <p>Grupo: ${props.costCenter ?? "—"}</p>
        <a href="/flight-plans/${props.id}" class="mt-2 inline-block text-cyan-700 underline dark:text-cyan-300">Abrir plan →</a>
      </div>`,
    )
    .addTo(map);
}

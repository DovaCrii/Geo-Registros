"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusChip } from "@/components/ui/status-chip";
import { useToast } from "@/lib/toast-context";
import { importKml, importDxf, importKmz } from "@/lib/geo-import";
import { exportKml, exportDxf } from "@/lib/geo-export";
import type { ImportResult } from "@/lib/geo-import";

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

type DrawMode =
  | "point"
  | "linestring"
  | "polygon"
  | "circle"
  | "select"
  | "delete-selection"
  | "undo"
  | "redo";

const DRAW_MODES: { id: DrawMode; label: string; icon: string; group: "draw" | "edit" }[] = [
  { id: "point", label: "Punto", icon: "⬤", group: "draw" },
  { id: "linestring", label: "Línea", icon: "╱", group: "draw" },
  { id: "polygon", label: "Polígono", icon: "⬠", group: "draw" },
  { id: "circle", label: "Círculo", icon: "◯", group: "draw" },
  { id: "select", label: "Seleccionar", icon: "☝", group: "edit" },
  { id: "delete-selection", label: "Borrar", icon: "✕", group: "edit" },
  { id: "undo", label: "Deshacer", icon: "↩", group: "edit" },
  { id: "redo", label: "Rehacer", icon: "↪", group: "edit" },
];

function parseGeoJsonPayload(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      valid: true as const,
      summary: "Sin geometría",
      data: emptyFeatureCollection,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        valid: false as const,
        summary: "El GeoJSON debe ser un objeto",
        data: emptyFeatureCollection,
      };
    }

    const type =
      "type" in parsed && typeof parsed.type === "string"
        ? parsed.type
        : "Unknown";

    return {
      valid: true as const,
      summary: type,
      data: parsed,
    };
  } catch {
    return {
      valid: false as const,
      summary: "El GeoJSON debe ser JSON válido",
      data: emptyFeatureCollection,
    };
  }
}

/** Compute area (m²) and perimeter (m) from a polygon geometry. */
function computeMeasurements(fc: GeoJSON.FeatureCollection): {
  totalArea: string;
  totalPerimeter: string;
  featureCount: number;
} {
  let totalArea = 0;
  let totalPerimeter = 0;
  let featureCount = 0;

  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    featureCount++;

    if (feature.geometry.type === "Polygon") {
      const coords = feature.geometry.coordinates[0];
      if (coords.length < 3) continue;
      totalPerimeter += computeRingLength(coords);
      totalArea += Math.abs(computePolygonArea(coords));
    } else if (feature.geometry.type === "MultiPolygon") {
      for (const ringGroup of feature.geometry.coordinates) {
        const coords = ringGroup[0];
        if (coords.length < 3) continue;
        totalPerimeter += computeRingLength(coords);
        totalArea += Math.abs(computePolygonArea(coords));
      }
    } else if (feature.geometry.type === "LineString") {
      totalPerimeter += computeRingLength(feature.geometry.coordinates);
    } else if (feature.geometry.type === "MultiLineString") {
      for (const coords of feature.geometry.coordinates) {
        totalPerimeter += computeRingLength(coords);
      }
    }
  }

  return {
    totalArea: totalArea > 0 ? formatArea(totalArea) : "—",
    totalPerimeter: totalPerimeter > 0 ? formatLength(totalPerimeter) : "—",
    featureCount,
  };
}

function computeRingLength(coords: number[][]): number {
  let length = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    length += haversineDistance(coords[i], coords[i + 1]);
  }
  return length;
}

function haversineDistance(a: number[], b: number[]): number {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a[1] * Math.PI) / 180) *
      Math.cos((b[1] * Math.PI) / 180) *
      sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function computePolygonArea(coords: number[][]): number {
  if (coords.length < 3) return 0;
  let area = 0;
  const R = 6371000;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const x1 = (coords[i][0] * Math.PI) / 180;
    const y1 = (coords[i][1] * Math.PI) / 180;
    const x2 = (coords[j][0] * Math.PI) / 180;
    const y2 = (coords[j][1] * Math.PI) / 180;
    area += (x2 - x1) * (2 + Math.sin(y1) + Math.sin(y2));
  }
  area = (area * R * R) / 2;
  return area;
}

function formatArea(m2: number): string {
  if (m2 >= 1_000_000) return `${(m2 / 1_000_000).toFixed(2)} km²`;
  if (m2 >= 1) return `${m2.toFixed(0)} m²`;
  return `${(m2 * 10_000).toFixed(0)} cm²`;
}

function formatLength(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m.toFixed(1)} m`;
}

/** Strip Terra Draw internal properties and return clean GeoJSON features. */
function featuresToCleanGeoJson(
  features: GeoJSON.Feature[],
): GeoJSON.FeatureCollection {
  const cleaned = features.map((f) => ({
    type: "Feature" as const,
    geometry: f.geometry,
    properties: f.properties ? { ...f.properties } : {},
  }));
  return { type: "FeatureCollection", features: cleaned };
}

/** Infer the Terra Draw mode name from a GeoJSON geometry type. */
function inferModeFromGeometryType(type: string): string {
  if (type === "Point" || type === "MultiPoint") return "point";
  if (type === "LineString" || type === "MultiLineString") return "linestring";
  return "polygon";
}

/**
 * Normalise any valid GeoJSON value into an array of feature-like objects.
 * Handles FeatureCollection, single Feature, and bare Geometry.
 */
function normalizeToFeatures(data: unknown): any[] {
  if (!data || typeof data !== "object") return [];

  const d = data as Record<string, unknown>;

  if (d.type === "FeatureCollection" && Array.isArray(d.features)) {
    return d.features as any[];
  }

  if (d.type === "Feature") {
    return [d];
  }

  // Bare geometry object → wrap in a Feature
  if (
    typeof d.type === "string" &&
    ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(d.type)
  ) {
    return [{ type: "Feature", geometry: d, properties: {} }];
  }

  if (d.type === "GeometryCollection") {
    const geometries = d.geometries as any[] | undefined;
    if (Array.isArray(geometries)) {
      return geometries.map((g) => ({
        type: "Feature",
        geometry: g,
        properties: {},
      }));
    }
  }

  return [];
}

/** Compute bounding box from an array of points and fit the map. */
function fitMapToPoints(map: Map, data: unknown) {
  const points: Array<[number, number]> = [];
  const features = normalizeToFeatures(data);

  for (const feature of features) {
    if (!feature.geometry?.type) continue;
    const coords = extractCoordinates(feature.geometry);
    for (const c of coords) points.push(c);
  }

  if (points.length === 0) {
    map.easeTo({ center: [-70.6693, -33.4489], zoom: 4, duration: 0 });
    return;
  }

  let minLng = points[0][0];
  let maxLng = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];

  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  if (minLng === maxLng && minLat === maxLat) {
    map.easeTo({ center: [minLng, minLat], zoom: 12, duration: 0 });
    return;
  }

  map.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    { padding: 48, duration: 300 },
  );
}

function extractCoordinates(
  geometry: GeoJSON.Geometry,
): Array<[number, number]> {
  const result: Array<[number, number]> = [];

  function walk(value: unknown) {
    if (!Array.isArray(value)) return;
    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      result.push([value[0], value[1]]);
      return;
    }
    for (const child of value) walk(child);
  }

  if ("coordinates" in geometry) walk(geometry.coordinates);

  if (geometry.type === "GeometryCollection") {
    for (const g of geometry.geometries) {
      if ("coordinates" in g) walk(g.coordinates);
    }
  }

  return result;
}

/**
 * Convert features to Terra Draw format (adds `properties.mode`).
 */
function featuresToTdFormat(features: any[]) {
  return features.map((f: any) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: {
      ...(f.properties || {}),
      mode: inferModeFromGeometryType(f.geometry?.type || "Polygon"),
    },
  }));
}

/* ------------------------------------------------------------------ */
/*  Toolbar button                                                      */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={Boolean(active)}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-cyan-500/30 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-500/10 dark:border-cyan-500/50 dark:bg-cyan-500/20 dark:text-cyan-200"
          : "border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-white"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GeometryEditor({
  title,
  description,
  action,
  flightPlanId,
  initialPayload,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  flightPlanId: string;
  initialPayload: string;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const [terraDrawReady, setTerraDrawReady] = useState(false);
  const [activeMode, setActiveMode] = useState<DrawMode | null>(null);
  const [importing, setImporting] = useState(false);
  const [measurements, setMeasurements] = useState({ totalArea: "—", totalPerimeter: "—", featureCount: 0 });
  const [layers, setLayers] = useState({
    satellite: true,
    operationArea: true,
    importedReferences: true,
  });
  const { toast } = useToast();
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawControlRef = useRef<MaplibreTerradrawControl | null>(null);
  const initialLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const parsed = useMemo(() => parseGeoJsonPayload(payload), [payload]);
  const enabledLayerCount = useMemo(
    () => Object.values(layers).filter(Boolean).length,
    [layers],
  );
  const workspaceModeSummary: {
    label: string;
    tone: "success" | "warning" | "danger" | "info" | "neutral";
    helper: string;
  } = useMemo(() => {
    if (!terraDrawReady) {
      return {
        label: "Cargando mapa",
        tone: "neutral" as const,
        helper: "Preparando herramientas y capas operativas.",
      };
    }

    if (activeMode) {
      const modeLabel = DRAW_MODES.find((mode) => mode.id === activeMode)?.label ?? activeMode;

      return {
        label: `Modo ${modeLabel}`,
        tone: "info" as const,
        helper:
          activeMode === "select"
            ? "Seleccioná figuras para moverlas o revisar su ubicación."
            : activeMode === "delete-selection"
              ? "Eliminá la selección actual con cuidado."
              : activeMode === "undo" || activeMode === "redo"
                ? "Revisá la secuencia de edición antes de guardar."
                : `Dibujá una nueva ${modeLabel.toLowerCase()} sobre el mapa satelital.`,
      };
    }

    return {
      label: payload.trim() ? "Geometría lista" : "Sin geometría",
      tone: payload.trim() ? "success" : "neutral",
      helper: payload.trim()
        ? "Podés seguir editando, importar referencias o guardar el área."
        : "Elegí una herramienta de dibujo para iniciar el área de operación.",
    };
  }, [activeMode, payload, terraDrawReady]);

  // ── Initialise map + Terra Draw control (runs once) ──────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution:
              "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          },
        },
        layers: [
          {
            id: "satellite-layer",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-70.6693, -33.4489],
      zoom: 4,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", () => {
      const control = new MaplibreTerradrawControl({
        modes: [
          "point",
          "linestring",
          "polygon",
          "circle",
          "select",
          "delete-selection",
          "undo",
          "redo",
        ],
      });

      map.addControl(control, "top-right");
      drawControlRef.current = control;
      setTerraDrawReady(true);
    });

    mapRef.current = map;

    return () => {
      drawControlRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Get Terra Draw instance (safe access) ─────────────────────────
  const getTerraDraw = useCallback(() => {
    return drawControlRef.current?.getTerraDrawInstance() ?? null;
  }, []);

  const syncPayloadFromMap = useCallback(() => {
    const fc = drawControlRef.current?.getFeatures();
    if (!fc) return;

    if (fc.features.length === 0) {
      setPayload("");
      setMeasurements({ totalArea: "—", totalPerimeter: "—", featureCount: 0 });
      return;
    }

    const cleaned = featuresToCleanGeoJson(fc.features as GeoJSON.Feature[]);
    setPayload(JSON.stringify(cleaned, null, 2));
    setMeasurements(computeMeasurements(cleaned));
  }, []);

  // ── Load existing GeoJSON into Terra Draw (once, when ready) ─────
  useEffect(() => {
    if (!terraDrawReady || initialLoadedRef.current) return;

    const terraDraw = getTerraDraw();
    if (!terraDraw) return;
    if (!parsed.valid) return;

    const features = normalizeToFeatures(parsed.data);
    if (features.length === 0) return;

    terraDraw.addFeatures(featuresToTdFormat(features) as any);
    initialLoadedRef.current = true;

    // Fit map to the loaded geometry
    fitMapToPoints(mapRef.current!, parsed.data);
  }, [terraDrawReady, parsed.valid, parsed.data, getTerraDraw]);

  // ── Sync Terra Draw → hidden GeoJSON payload after draw/edit/delete ─
  useEffect(() => {
    const control = drawControlRef.current;
    if (!control) return;

    const eventNames = [
      "mode-changed",
      "finish",
      "change",
      "feature-created",
      "feature-updated",
      "feature-deleted",
      "selection-changed",
    ];

    const controlWithEvents = control as any;

    for (const eventName of eventNames) {
      controlWithEvents.on?.(eventName, syncPayloadFromMap);
    }

    return () => {
      for (const eventName of eventNames) {
        controlWithEvents.off?.(eventName, syncPayloadFromMap);
      }
    };
  }, [terraDrawReady, syncPayloadFromMap]);

  // ── Apply textarea content to map ─────────────────────────────────
  const handleApplyFromTextarea = useCallback(() => {
    if (!parsed.valid) return;

    const terraDraw = getTerraDraw();
    if (!terraDraw) return;

    // Clear existing features
    const existingFc = drawControlRef.current?.getFeatures();
    if (existingFc && existingFc.features.length > 0) {
      terraDraw.clear();
    }

    const features = normalizeToFeatures(parsed.data);
    if (features.length === 0) return;

    terraDraw.addFeatures(featuresToTdFormat(features) as any);
    fitMapToPoints(mapRef.current!, parsed.data);
  }, [parsed, getTerraDraw]);

  // ── Apply imported data to Terra Draw + textarea ──────────────────
  const applyImport = useCallback(
    (result: ImportResult) => {
      const terraDraw = getTerraDraw();
      if (!terraDraw) return;

      terraDraw.clear();
      terraDraw.addFeatures(
        featuresToTdFormat(result.features.features) as any,
      );

      setPayload(JSON.stringify(result.features, null, 2));
      fitMapToPoints(mapRef.current!, result.features);
    },
    [getTerraDraw],
  );

  // ── Import file handler ───────────────────────────────────────────
  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase();

        let result: ImportResult;

        if (ext === "kmz") {
          const arrayBuffer = await file.arrayBuffer();
          result = await importKmz(arrayBuffer);
        } else if (ext === "kml") {
          const text = await file.text();
          result = importKml(text);
        } else if (ext === "dxf") {
          const text = await file.text();
          result = importDxf(text);
        } else {
          toast("error", "Formato no soportado", "Usá archivos .kml, .kmz o .dxf.");
          return;
        }

        applyImport(result);
        toast("success", "Geometría importada", result.summary);
      } catch (err) {
        toast("error", "Error al importar", err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [applyImport, toast],
  );

  // ── Set draw mode ────────────────────────────────────────────────
  const handleSetMode = useCallback(
    (mode: DrawMode) => {
      const terraDraw = getTerraDraw();
      if (!terraDraw) return;

      terraDraw.setMode(mode);
      setActiveMode(mode);
      window.setTimeout(syncPayloadFromMap, 0);
    },
    [getTerraDraw, syncPayloadFromMap],
  );

  const handleLayerToggle = useCallback((layer: keyof typeof layers) => {
    setLayers((prev) => {
      const next = { ...prev, [layer]: !prev[layer] };

      if (layer === "satellite" && mapRef.current?.getLayer("satellite-layer")) {
        mapRef.current.setLayoutProperty(
          "satellite-layer",
          "visibility",
          next.satellite ? "visible" : "none",
        );
      }

      return next;
    });
  }, []);

  // ── Export handler ────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: "kml" | "dxf") => {
      const control = drawControlRef.current;
      const fc = control?.getFeatures();
      if (!fc || fc.features.length === 0) {
        toast("info", "Sin geometría", "Dibujá o cargá una geometría antes de exportar.");
        return;
      }

      const cleaned = featuresToCleanGeoJson(
        fc.features as GeoJSON.Feature[],
      );
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "kml") {
        content = exportKml(cleaned);
        mimeType = "application/vnd.google-earth.kml+xml";
        extension = "kml";
      } else {
        content = exportDxf(cleaned);
        mimeType = "application/dxf";
        extension = "dxf";
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flight-plan-geometry.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      toast("success", `Exportado a ${format.toUpperCase()}`, `Archivo generado correctamente en formato ${format.toUpperCase()}.`);
    },
    [toast],
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="flightPlanId" value={flightPlanId} />
      <input type="hidden" name="geometryPayload" value={payload} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-950/10 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/45">
          <div className="border-b border-slate-200 bg-white/95 px-6 py-5 dark:border-slate-800/80 dark:bg-slate-950/75">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
                  Editor satelital
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  Mapa de operación y áreas de vuelo
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Dibujá el polígono de vuelo, activá capas de referencia y guardá el área sin trabajar con JSON manual.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip
                  label={payload.trim() ? "Área en edición" : "Sin área"}
                  tone={payload.trim() ? "info" : "neutral"}
                />
                <StatusChip
                  label={parsed.valid ? "Mapa listo" : "Revisar dato"}
                  tone={parsed.valid ? "success" : "warning"}
                />
              </div>
            </div>
          </div>

          <div className="relative h-[480px] bg-slate-100 dark:bg-slate-950 sm:h-[600px] xl:h-[720px]">
            <div ref={containerRef} className="h-full w-full" />
            {/* Contextual hint */}
            <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-lg shadow-slate-950/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/85 dark:text-slate-200">
              <p className="font-semibold text-slate-950 dark:text-white">
                {measurements.featureCount > 0 ? `Editor — ${measurements.featureCount} figura${measurements.featureCount !== 1 ? "s" : ""}` : "Siguiente acción"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {measurements.featureCount > 0
                  ? "Usá Seleccionar para mover figuras. Guardá el área antes de salir."
                  : "Elegí Polígono, marcá la zona de operación y guardá el área."}
              </p>
            </div>
            {measurements.featureCount > 0 && (
              <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/90 px-4 py-2 text-xs font-medium text-emerald-700 backdrop-blur dark:bg-emerald-500/10 dark:text-emerald-200">
                {measurements.totalArea} · {measurements.totalPerimeter}
              </div>
            )}
            {!parsed.valid && payload.trim() ? (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 backdrop-blur dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                La geometría interna necesita revisión antes de guardar.
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <DetailPanel title={title} description={description}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/[0.06]" role="status" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                      Siguiente acción
                    </p>
                    <p className="mt-1 text-sm font-medium text-cyan-950 dark:text-cyan-50">
                      {measurements.featureCount > 0
                        ? "Seguí refinando la geometría o exportá el resultado final."
                        : "Arrancá con un polígono o importá una referencia operativa."}
                    </p>
                  </div>
                  <StatusChip label={measurements.featureCount > 0 ? "Con geometría" : "Sin geometría"} tone={measurements.featureCount > 0 ? "success" : "neutral"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ToolbarButton
                    active={activeMode === "polygon"}
                    icon="⬠"
                    label="Polígono"
                    onClick={() => handleSetMode("polygon")}
                  />
                  <ToolbarButton icon="📂" label="Importar" onClick={() => fileInputRef.current?.click()} />
                  {measurements.featureCount > 0 ? (
                    <ToolbarButton icon="⬇" label="Exportar KML" onClick={() => handleExport("kml")} />
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-950/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Figuras
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {measurements.featureCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-950/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      GeoJSON
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {parsed.valid ? "Válido" : "Revisar"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-950/70" role="status" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                      Estado del workspace
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {workspaceModeSummary.label}
                    </p>
                  </div>
                  <StatusChip label={workspaceModeSummary.label} tone={workspaceModeSummary.tone} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  {workspaceModeSummary.helper}
                </p>
              </div>

              {/* Measurement panel */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-4 dark:bg-cyan-500/[0.06]">
                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                  {measurements.featureCount > 0
                    ? `Geometría activa (${measurements.featureCount})`
                    : "Sin geometría"}
                </p>
                {measurements.featureCount > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-cyan-500/15 bg-white/80 px-3 py-2 text-center dark:bg-slate-950/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Área</p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-cyan-700 dark:text-cyan-200">{measurements.totalArea}</p>
                    </div>
                    <div className="rounded-xl border border-cyan-500/15 bg-white/80 px-3 py-2 text-center dark:bg-slate-950/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Perímetro</p>
                      <p className="mt-0.5 font-mono text-sm font-bold text-cyan-700 dark:text-cyan-200">{measurements.totalPerimeter}</p>
                    </div>
                  </div>
                )}
                {measurements.featureCount === 0 && (
                  <p className="mt-1 text-xs leading-5 text-cyan-800/80 dark:text-cyan-200/80">
                    Dibujá un polígono o línea para ver mediciones en vivo.
                  </p>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Herramientas</p>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {activeMode ? `Modo: ${DRAW_MODES.find((mode) => mode.id === activeMode)?.label ?? activeMode}` : "Sin modo activo"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
                    Dibujar
                  </span>
                  {DRAW_MODES.filter((m) => m.group === "draw").map((mode) => (
                    <ToolbarButton
                      key={mode.id}
                      active={activeMode === mode.id}
                      icon={mode.icon}
                      label={mode.label}
                      onClick={() => handleSetMode(mode.id)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
                    Editar
                  </span>
                  {DRAW_MODES.filter((m) => m.group === "edit").map((mode) => (
                    <ToolbarButton
                      key={mode.id}
                      active={activeMode === mode.id}
                      icon={mode.icon}
                      label={mode.label}
                      onClick={() => handleSetMode(mode.id)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".kml,.kmz,.dxf"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                  <ToolbarButton
                    icon="📂"
                    label={importing ? "Importando..." : "Importar"}
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3 dark:border-slate-800/80 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Capas</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">
                      {enabledLayerCount}/3 visibles
                    </span>
                  </div>

                  {[
                    { key: "satellite" as const, label: "Base satelital", desc: "Mapa de referencia visual" },
                    { key: "operationArea" as const, label: "Área de operación", desc: "Figuras activas del plan" },
                    { key: "importedReferences" as const, label: "Referencias importadas", desc: "KML, KMZ o DXF cargados" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleLayerToggle(item.key)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-left transition hover:border-cyan-500/30 hover:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-cyan-500/30"
                    >
                      <span>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-500">{item.desc}</span>
                      </span>
                      <span
                        className={`relative h-6 w-11 rounded-full transition ${
                          layers[item.key] ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        aria-hidden="true"
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                            layers[item.key] ? "left-6" : "left-1"
                          }`}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Acciones</p>
                  <span className="text-xs text-slate-500 dark:text-slate-500">Guardar / volver</span>
                </div>

                <div className="flex flex-col gap-2">
                  <PrimaryButton type="submit">Guardar área de operación</PrimaryButton>
                  <Link
                    href={`/flight-plans/${flightPlanId}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Volver al plan de vuelo
                  </Link>
                </div>
              </div>

            </div>
          </DetailPanel>

          <DetailPanel title="Intercambio técnico (opcional)" description="Opciones secundarias para CAD/GIS y soporte avanzado.">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExport("kml")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                  Exportar KML
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("dxf")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                  Exportar DXF
                </button>
              </div>

              <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
                  Ver GeoJSON avanzado
                </summary>
                <label className="mt-4 block space-y-2">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                    GeoJSON interno
                  </span>
                  <textarea
                    rows={10}
                    value={payload}
                    onChange={(event) => setPayload(event.target.value)}
                    placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]},"properties":{}}'
                    className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 font-mono text-xs leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleApplyFromTextarea}
                  disabled={!parsed.valid}
                  className="mt-3 inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                >
                  Aplicar desde texto
                </button>
              </details>
            </div>
          </DetailPanel>
        </aside>
      </div>
    </form>
  );
}

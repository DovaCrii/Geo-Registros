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
  const { toast } = useToast();
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawControlRef = useRef<MaplibreTerradrawControl | null>(null);
  const initialLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const parsed = useMemo(() => parseGeoJsonPayload(payload), [payload]);

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

  // ── Sync Terra Draw → textarea on mode change ────────────────────
  useEffect(() => {
    const control = drawControlRef.current;
    if (!control) return;

    const handleModeChange = () => {
      const fc = control.getFeatures();
      if (!fc) return;

      if (fc.features.length > 0) {
        const cleaned = featuresToCleanGeoJson(
          fc.features as GeoJSON.Feature[],
        );
        setPayload(JSON.stringify(cleaned, null, 2));
      }
    };

    control.on("mode-changed", handleModeChange);

    return () => {
      control.off("mode-changed", handleModeChange);
    };
  }, [terraDrawReady]);

  // ── Sync Terra Draw → textarea also on feature delete ────────────
  useEffect(() => {
    const control = drawControlRef.current;
    if (!control) return;

    const handleDelete = () => {
      const fc = control.getFeatures();
      if (!fc) return;

      if (fc.features.length > 0) {
        const cleaned = featuresToCleanGeoJson(
          fc.features as GeoJSON.Feature[],
        );
        setPayload(JSON.stringify(cleaned, null, 2));
      } else {
        setPayload("");
      }
    };

    control.on("feature-deleted", handleDelete);

    return () => {
      control.off("feature-deleted", handleDelete);
    };
  }, [terraDrawReady]);

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
    },
    [getTerraDraw],
  );

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-950/10 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/45">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Mapa y geometría asistida
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Dibujá puntos, líneas, polígonos o círculos sobre el mapa satelital. Importá KMZ/KML/DXF y exportá de vuelta.
              </p>
            </div>
            <StatusChip
              label={parsed.summary}
              tone={parsed.valid ? "info" : "warning"}
            />
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/70">
          {/* Drawing tools */}
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

          <span className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700/60" />

          {/* Edit tools */}
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
            Editar
          </span>
          {DRAW_MODES.filter((m) => m.group === "edit").map((mode) => (
            <ToolbarButton
              key={mode.id}
              icon={mode.icon}
              label={mode.label}
              onClick={() => handleSetMode(mode.id)}
            />
          ))}

          <span className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700/60" />

          {/* Import / Export */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".kml,.kmz,.dxf"
            className="hidden"
            onChange={handleImportFile}
          />
          <ToolbarButton
            icon="📂"
            label={importing ? "Importando…" : "Importar"}
            onClick={() => fileInputRef.current?.click()}
          />
          <ToolbarButton
            icon="📤"
            label="KML"
            onClick={() => handleExport("kml")}
          />
          <ToolbarButton
            icon="📤"
            label="DXF"
            onClick={() => handleExport("dxf")}
          />
        </div>

        {/* Map */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[560px] bg-slate-100 dark:bg-slate-950">
          <div ref={containerRef} className="h-full w-full" />
          {!parsed.valid ? (
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 backdrop-blur dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              La vista previa se pausa hasta que el GeoJSON vuelva a ser válido.
            </div>
          ) : null}
        </div>
      </section>

      <DetailPanel title={title} description={description}>
        <form action={action} className="space-y-4">
          <input type="hidden" name="flightPlanId" value={flightPlanId} />

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
              GeoJSON de la geometría
            </span>
            <textarea
              name="geometryPayload"
              rows={14}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]},"properties":{}}'
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 font-mono text-xs leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          {/* ── Action buttons row ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFromTextarea}
              disabled={!parsed.valid}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              Aplicar desde texto
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800/80 dark:bg-slate-950/70 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Estado actual</span>
              <StatusChip
                label={parsed.valid ? "Vista activa" : "Error de validación"}
                tone={parsed.valid ? "info" : "warning"}
              />
            </div>
            <p className="leading-6 text-slate-700 dark:text-slate-300">
              <strong>Dibujar:</strong> Usá la barra de herramientas para crear puntos, líneas, polígonos o círculos. Cambiá a <strong>Seleccionar</strong> para mover o borrar elementos. También tenés Deshacer / Rehacer.
            </p>
            <p className="leading-6 text-slate-700 dark:text-slate-300">
              <strong>Importar / exportar:</strong> Cargá KMZ, KML o DXF, editá libremente y exportá la geometría para CAD (AutoCAD / DraftSight / QGIS).
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <PrimaryButton type="submit">Guardar área de operación</PrimaryButton>
            <Link
              href={`/flight-plans/${flightPlanId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            >
              Volver al plan de vuelo
            </Link>
          </div>
        </form>
      </DetailPanel>
    </div>
  );
}

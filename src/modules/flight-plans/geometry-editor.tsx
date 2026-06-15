"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

import { DetailPanel } from "@/components/ui/detail-panel";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusChip } from "@/components/ui/status-chip";
import { importKml, importDxf } from "@/lib/geo-import";
import { exportKml, exportDxf } from "@/lib/geo-export";
import type { ImportResult } from "@/lib/geo-import";

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

function parseGeoJsonPayload(text: string) {
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      valid: true as const,
      summary: "No geometry attached yet",
      data: emptyFeatureCollection,
    };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        valid: false as const,
        summary: "Geometry must be a GeoJSON object",
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
      summary: "Geometry must be valid JSON",
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
  const [importing, setImporting] = useState(false);
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
      style: "https://demotiles.maplibre.org/style.json",
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

  // ── Load existing GeoJSON into Terra Draw (once, when ready) ─────
  useEffect(() => {
    if (!terraDrawReady || initialLoadedRef.current) return;

    const control = drawControlRef.current;
    const terraDraw = control?.getTerraDrawInstance();
    if (!terraDraw) return;
    if (!parsed.valid) return;

    const features = normalizeToFeatures(parsed.data);
    if (features.length === 0) return;

    terraDraw.addFeatures(featuresToTdFormat(features) as any);
    initialLoadedRef.current = true;

    // Fit map to the loaded geometry
    fitMapToPoints(mapRef.current!, parsed.data);
  }, [terraDrawReady, parsed.valid, parsed.data]);

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

    const control = drawControlRef.current;
    const terraDraw = control?.getTerraDrawInstance();
    if (!terraDraw) return;

    // Clear existing features
    const existingFc = control?.getFeatures();
    if (existingFc && existingFc.features.length > 0) {
      terraDraw.clear();
    }

    const features = normalizeToFeatures(parsed.data);
    if (features.length === 0) return;

    terraDraw.addFeatures(featuresToTdFormat(features) as any);
    fitMapToPoints(mapRef.current!, parsed.data);
  }, [parsed]);

  // ── Apply imported data to Terra Draw + textarea ──────────────────
  const applyImport = useCallback(
    (result: ImportResult) => {
      const control = drawControlRef.current;
      const terraDraw = control?.getTerraDrawInstance();
      if (!terraDraw) return;

      terraDraw.clear();
      terraDraw.addFeatures(
        featuresToTdFormat(result.features.features) as any,
      );

      setPayload(JSON.stringify(result.features, null, 2));
      fitMapToPoints(mapRef.current!, result.features);
    },
    [],
  );

  // ── Import file handler ───────────────────────────────────────────
  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        const ext = file.name.split(".").pop()?.toLowerCase();

        let result: ImportResult;
        if (ext === "kml" || ext === "kmz") {
          result = importKml(text);
        } else if (ext === "dxf") {
          result = importDxf(text);
        } else {
          alert("Unsupported file format. Use .kml, .kmz or .dxf");
          return;
        }

        applyImport(result);
      } catch (err) {
        alert(
          `Import error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        );
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [applyImport],
  );

  // ── Export handler ────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: "kml" | "dxf") => {
      const control = drawControlRef.current;
      const fc = control?.getFeatures();
      if (!fc || fc.features.length === 0) {
        alert("No geometry to export. Draw or load features first.");
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
    },
    [],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_420px]">
      <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/45 shadow-xl shadow-slate-950/10 backdrop-blur">
        <div className="border-b border-slate-800/80 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Map-assisted geometry
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Draw points, lines, polygons and circles on the map. Import KML
                or DXF files, export back to either format.
              </p>
            </div>
            <StatusChip
              label={parsed.summary}
              tone={parsed.valid ? "info" : "warning"}
            />
          </div>
        </div>

        <div className="relative h-[560px] bg-slate-950">
          <div ref={containerRef} className="h-full w-full" />
          {!parsed.valid ? (
            <div className="pointer-events-none absolute inset-x-4 top-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 backdrop-blur">
              The preview is paused until the GeoJSON becomes valid again.
            </div>
          ) : null}
        </div>
      </section>

      <DetailPanel title={title} description={description}>
        <form action={action} className="space-y-4">
          <input type="hidden" name="flightPlanId" value={flightPlanId} />

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Geometry payload (GeoJSON)
            </span>
            <textarea
              name="geometryPayload"
              rows={14}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]},"properties":{}}'
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 font-mono text-xs leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          {/* ── Action buttons row ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFromTextarea}
              disabled={!parsed.valid}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply from textarea
            </button>

            {/* Import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".kml,.kmz,.dxf"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              type="button"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importing…" : "Import KML/DXF"}
            </button>

            {/* Export dropdown-like pair */}
            <button
              type="button"
              onClick={() => handleExport("kml")}
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-700/50 bg-emerald-900/40 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:border-emerald-600/60 hover:bg-emerald-800/50"
            >
              Export KML
            </button>
            <button
              type="button"
              onClick={() => handleExport("dxf")}
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-700/50 bg-emerald-900/40 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:border-emerald-600/60 hover:bg-emerald-800/50"
            >
              Export DXF
            </button>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current state</span>
              <StatusChip
                label={parsed.valid ? "Preview active" : "Validation error"}
                tone={parsed.valid ? "info" : "warning"}
              />
            </div>
            <p className="leading-6 text-slate-300">
              <strong>Draw:</strong> Use the map toolbar to draw points, lines,
              polygons, or circles. Switch to <strong>Select</strong> mode to
              move or delete features. Undo / Redo are also available.
            </p>
            <p className="leading-6 text-slate-300">
              <strong>Import / Export:</strong> Load KML or DXF files into the
              map, then edit freely. Export the current geometry back to KML or
              DXF for use in CAD (AutoCAD / DraftSight / QGIS).
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <PrimaryButton type="submit">Save geometry</PrimaryButton>
            <Link
              href={`/flight-plans/${flightPlanId}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              Back to flight plan
            </Link>
          </div>
        </form>
      </DetailPanel>
    </div>
  );
}

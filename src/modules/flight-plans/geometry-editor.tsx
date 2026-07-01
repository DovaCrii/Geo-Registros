"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { Map } from "maplibre-gl";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";

import { DetailPanel } from "@/components/ui/detail-panel";
import { StatusChip } from "@/components/ui/status-chip";
import { SubmitButton } from "@/components/ui/submit-button";
import { useToast } from "@/lib/toast-context";
import { importKml, importDxf, importKmz } from "@/lib/geo-import";
import { exportKml, exportDxf } from "@/lib/geo-export";
import { findGeoRestrictionConflicts } from "@/lib/geo-restrictions";
import type { GeocodeResult } from "@/lib/geocoding";
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

type EntityType = "operation-area" | "reference" | "obstacle" | "note";

type FeatureMetadata = {
  id: string;
  name: string;
  entityType: EntityType;
  visible: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
};

const ENTITY_LABELS: Record<EntityType, string> = {
  "operation-area": "Área",
  reference: "Referencia",
  obstacle: "Obstáculo",
  note: "Nota",
};

const ENTITY_COLORS: Record<EntityType, string> = {
  "operation-area": "#0ea5e9",
  reference: "#f59e0b",
  obstacle: "#ef4444",
  note: "#8b5cf6",
};

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

function isPersistableFeature(feature: GeoJSON.Feature | null | undefined): feature is GeoJSON.Feature {
  if (!feature || feature.type !== "Feature" || !feature.geometry) return false;

  const geometry = feature.geometry as GeoJSON.Geometry;
  if (geometry.type === "GeometryCollection") {
    return Array.isArray((geometry as GeoJSON.GeometryCollection).geometries);
  }

  return typeof geometry.type === "string" && "coordinates" in geometry;
}

/** Strip Terra Draw internal properties and return only persistable GeoJSON features. */
function featuresToCleanGeoJson(
  features: GeoJSON.Feature[],
): GeoJSON.FeatureCollection {
  const cleaned = features.filter(isPersistableFeature).map((f) => ({
    type: "Feature" as const,
    geometry: f.geometry,
    properties: f.properties ? { ...f.properties } : {},
  }));
  return { type: "FeatureCollection", features: cleaned };
}

function getFeatureId(feature: GeoJSON.Feature | any): string | null {
  const props = (feature?.properties ?? {}) as Record<string, unknown>;
  const id = typeof props.id === "string" ? props.id : typeof feature?.id === "string" ? feature.id : null;
  return id;
}

function inferEntityTypeFromGeometryType(type: string): EntityType {
  if (type === "Point" || type === "MultiPoint") return "note";
  if (type === "LineString" || type === "MultiLineString") return "reference";
  return "operation-area";
}

function createFeatureId() {
  return globalThis.crypto?.randomUUID?.() ?? `feature-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeFeatureCollection(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  const counters: Record<EntityType, number> = {
    "operation-area": 0,
    reference: 0,
    obstacle: 0,
    note: 0,
  };

  const now = new Date().toISOString();
  const normalized = features.filter(isPersistableFeature).map((feature) => {
    const properties = ((feature.properties ?? {}) as Record<string, unknown>);
    const entityType = (typeof properties.entityType === "string" && properties.entityType in ENTITY_LABELS
      ? properties.entityType
      : inferEntityTypeFromGeometryType(feature.geometry.type)) as EntityType;

    counters[entityType] += 1;
    const index = counters[entityType];
    const existingId = typeof properties.id === "string" ? properties.id : null;
    const createdAt = typeof properties.createdAt === "string" ? properties.createdAt : now;

    const metadata: FeatureMetadata = {
      id: existingId ?? createFeatureId(),
      name: typeof properties.name === "string" && properties.name.trim().length > 0
        ? properties.name
        : `${ENTITY_LABELS[entityType]} ${index}`,
      entityType,
      visible: typeof properties.visible === "boolean" ? properties.visible : true,
      color: typeof properties.color === "string" && properties.color.trim().length > 0
        ? properties.color
        : ENTITY_COLORS[entityType],
      createdAt,
      updatedAt: now,
    };

    return {
      type: "Feature" as const,
      geometry: feature.geometry,
      properties: {
        ...properties,
        ...metadata,
      },
    };
  });

  return { type: "FeatureCollection", features: normalized };
}

function getSelectedFeatureId(features: GeoJSON.Feature[]): string | null {
  const selected = features.find((feature) => getFeatureId(feature));
  return selected ? getFeatureId(selected) : null;
}

function findFeatureById(features: GeoJSON.Feature[], id: string | null) {
  if (!id) return null;
  return features.find((feature) => getFeatureId(feature) === id) ?? null;
}

function getFeatureEntityType(feature: GeoJSON.Feature): EntityType {
  const properties = (feature.properties ?? {}) as Record<string, unknown>;
  return (typeof properties.entityType === "string" && properties.entityType in ENTITY_LABELS
    ? properties.entityType
    : inferEntityTypeFromGeometryType(feature.geometry.type)) as EntityType;
}

function getFeatureName(feature: GeoJSON.Feature): string {
  const properties = (feature.properties ?? {}) as Record<string, unknown>;
  const id = getFeatureId(feature);
  return typeof properties.name === "string" && properties.name.trim().length > 0
    ? properties.name
    : id ?? "Elemento sin nombre";
}

function getFeatureVisible(feature: GeoJSON.Feature): boolean {
  const properties = (feature.properties ?? {}) as Record<string, unknown>;
  return typeof properties.visible === "boolean" ? properties.visible : true;
}

function serializeFeatures(features: GeoJSON.Feature[]): string {
  const cleaned = featuresToCleanGeoJson(normalizeFeatureCollection(features).features as GeoJSON.Feature[]);
  return cleaned.features.length === 0 ? "" : JSON.stringify(cleaned, null, 2);
}

function parseInitialFeatures(initialPayload: string): GeoJSON.Feature[] {
  try {
    const parsed = parseGeoJsonPayload(initialPayload);
    if (!parsed.valid) return [];
    return normalizeFeatureCollection(normalizeToFeatures(parsed.data).filter(isPersistableFeature) as GeoJSON.Feature[]).features as GeoJSON.Feature[];
  } catch {
    return [];
  }
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
  const [features, setFeatures] = useState<GeoJSON.Feature[]>(() => parseInitialFeatures(initialPayload));
  const featuresRef = useRef<GeoJSON.Feature[]>(features);
  const [payload, setPayload] = useState(() => serializeFeatures(features));
  const [terraDrawReady, setTerraDrawReady] = useState(false);
  const [activeMode, setActiveMode] = useState<DrawMode | null>(null);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [lastSearchResult, setLastSearchResult] = useState<GeocodeResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<"clean" | "dirty" | "saving" | "error">("clean");
  const [measurements, setMeasurements] = useState(() =>
    features.length === 0 ? { totalArea: "—", totalPerimeter: "—", featureCount: 0 } : computeMeasurements({ type: "FeatureCollection", features }),
  );
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [layers, setLayers] = useState({
    satellite: true,
    "operation-area": true,
    reference: true,
    obstacle: true,
    note: true,
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement | null>(null);
  const geometryPayloadInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawControlRef = useRef<MaplibreTerradrawControl | null>(null);
  const searchPointSourceId = "search-point-source";
  const searchPointLayerId = "search-point-layer";
  const renderingMapRef = useRef(false);
  const skipNextMapRenderRef = useRef(false);
  const lastRenderedVisiblePayloadRef = useRef<string>("");
  const initialLoadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const parsed = useMemo(() => parseGeoJsonPayload(payload), [payload]);
  const restrictionConflicts = useMemo(
    () => (parsed.valid ? findGeoRestrictionConflicts(parsed.data) : []),
    [parsed.data, parsed.valid],
  );
  const enabledLayerCount = useMemo(() => (["operation-area", "reference", "obstacle", "note"] as EntityType[]).filter((key) => layers[key]).length, [layers]);
  const visibleFeatures = useMemo(
    () => features.filter((feature) => getFeatureVisible(feature) && layers[getFeatureEntityType(feature)]),
    [features, layers],
  );
  const visibleFeatureIds = useMemo(() => new Set(visibleFeatures.map((feature) => getFeatureId(feature)).filter(Boolean)), [visibleFeatures]);
  const featureCounts = useMemo(() => {
    const counts: Record<EntityType, { total: number; visible: number }> = {
      "operation-area": { total: 0, visible: 0 },
      reference: { total: 0, visible: 0 },
      obstacle: { total: 0, visible: 0 },
      note: { total: 0, visible: 0 },
    };
    for (const feature of features) {
      const type = getFeatureEntityType(feature);
      counts[type].total += 1;
      if (getFeatureVisible(feature) && layers[type]) counts[type].visible += 1;
    }
    return counts;
  }, [features, layers]);
  const saveStatusLabel = {
    clean: "Sin cambios",
    dirty: "Cambios sin guardar",
    saving: "Guardando…",
    error: "Error al guardar",
  }[saveStatus];
  const saveStatusTone: "success" | "warning" | "danger" | "info" | "neutral" =
    saveStatus === "dirty" ? "warning" : saveStatus === "saving" ? "info" : saveStatus === "error" ? "danger" : "success";
  const restrictionSignature = restrictionConflicts.map((zone) => zone.id).join("|");
  const lastRestrictionToastRef = useRef<string | null>(null);
  const selectedFeature = useMemo(() => findFeatureById(features, selectedFeatureId), [features, selectedFeatureId]);
  const workspaceModeSummary: {
    label: string;
    tone: "success" | "warning" | "danger" | "info" | "neutral";
    helper: string;
  } = useMemo(() => {
    if (restrictionConflicts.length > 0) {
      return {
        label: "Zona restringida detectada",
        tone: "warning" as const,
        helper: `El área cruza ${restrictionConflicts.length === 1 ? "una zona" : `${restrictionConflicts.length} zonas`} sensibles. Revisá antes de guardar.`,
      };
    }

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
  }, [activeMode, payload, restrictionConflicts.length, terraDrawReady]);

  useEffect(() => {
    featuresRef.current = features;
    const nextPayload = serializeFeatures(features);
    setPayload(nextPayload);
    setMeasurements(
      features.length === 0
        ? { totalArea: "—", totalPerimeter: "—", featureCount: 0 }
        : computeMeasurements({ type: "FeatureCollection", features }),
    );
    if (geometryPayloadInputRef.current) {
      geometryPayloadInputRef.current.value = nextPayload;
    }
  }, [features]);

  useEffect(() => {
    if (!restrictionSignature) {
      lastRestrictionToastRef.current = null;
      return;
    }

    if (lastRestrictionToastRef.current === restrictionSignature) return;

    const zoneLabels = restrictionConflicts.map((zone) => zone.label).join(", ");
    toast(
      "info",
      "Área con restricción geográfica",
      `La geometría intersecta ${zoneLabels}.`,
    );
    lastRestrictionToastRef.current = restrictionSignature;
  }, [restrictionConflicts, restrictionSignature, toast]);

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
      if (!map.getSource(searchPointSourceId)) {
        map.addSource(searchPointSourceId, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: searchPointLayerId,
          type: "circle",
          source: searchPointSourceId,
          paint: {
            "circle-radius": 9,
            "circle-color": "#06b6d4",
            "circle-opacity": 0.85,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
          },
        });
      }
    });

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

  const syncFeaturesFromMap = useCallback(() => {
    try {
      if (renderingMapRef.current) return;
      const fc = drawControlRef.current?.getFeatures();
      if (!fc) return;

      const normalized = normalizeFeatureCollection(fc.features as GeoJSON.Feature[]).features as GeoJSON.Feature[];
      const selected = drawControlRef.current?.getFeatures(true);
      const nextSelectedId = selected ? getSelectedFeatureId(selected.features as GeoJSON.Feature[]) : null;

      const currentPayload = serializeFeatures(featuresRef.current);
      const nextCurrent = featuresRef.current.filter((feature) => {
        const id = getFeatureId(feature);
        return !id || !normalized.some((nextFeature) => getFeatureId(nextFeature) === id);
      });
      const nextFeatures = [...nextCurrent, ...normalized];
      const nextPayload = serializeFeatures(nextFeatures);

      if (nextPayload === currentPayload) {
        if (selectedFeatureId !== nextSelectedId) {
          setSelectedFeatureId(nextSelectedId);
        }
        return;
      }

      setSelectedFeatureId(nextSelectedId);
      skipNextMapRenderRef.current = true;
      setFeatures(nextFeatures);
      setSaveStatus("dirty");
    } catch (error) {
      console.error("[GeometryEditor] syncFeaturesFromMap failed", error);
      setSaveStatus("error");
      toast("error", "Error al sincronizar el mapa", "La edición actual no pudo actualizarse desde el mapa. Probá recargar la vista.");
    }
  }, [toast, visibleFeatureIds]);

  const renderFeaturesToMap = useCallback(
    (nextVisibleFeatures: GeoJSON.Feature[]) => {
      try {
        const terraDraw = getTerraDraw();
        if (!terraDraw || !terraDrawReady) return;

        const nextVisiblePayload = serializeFeatures(nextVisibleFeatures);
        if (nextVisiblePayload === lastRenderedVisiblePayloadRef.current) {
          return;
        }

        renderingMapRef.current = true;
        lastRenderedVisiblePayloadRef.current = nextVisiblePayload;
        const existingFc = drawControlRef.current?.getFeatures();
        if (existingFc && existingFc.features.length > 0) {
          terraDraw.clear();
        }
        if (nextVisibleFeatures.length > 0) {
          terraDraw.addFeatures(featuresToTdFormat(nextVisibleFeatures) as any);
        }
      } catch (error) {
        console.error("[GeometryEditor] renderFeaturesToMap failed", error);
        setSaveStatus("error");
      } finally {
        window.setTimeout(() => {
          renderingMapRef.current = false;
        }, 0);
      }
    },
    [getTerraDraw, terraDrawReady],
  );

  useEffect(() => {
    if (skipNextMapRenderRef.current) {
      skipNextMapRenderRef.current = false;
      return;
    }
    renderFeaturesToMap(visibleFeatures);
  }, [renderFeaturesToMap, visibleFeatures]);

  const syncPayloadFromMap = useCallback(() => {
    syncFeaturesFromMap();
  }, [syncFeaturesFromMap]);

  const markDirtyFeatures = useCallback((updater: (current: GeoJSON.Feature[]) => GeoJSON.Feature[]) => {
    setFeatures((current) => normalizeFeatureCollection(updater(current)).features as GeoJSON.Feature[]);
    setSaveStatus("dirty");
  }, []);

  // ── Load existing GeoJSON into Terra Draw (once, when ready) ─────
  useEffect(() => {
    if (!terraDrawReady || initialLoadedRef.current) return;

    if (!parsed.valid) return;

    if (features.length === 0) return;

    initialLoadedRef.current = true;

    // Fit map to the loaded geometry
    fitMapToPoints(mapRef.current!, parsed.data);
  }, [terraDrawReady, parsed.valid, parsed.data, features.length]);

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
    try {
      if (!parsed.valid) return;

      const nextFeatures = normalizeFeatureCollection(normalizeToFeatures(parsed.data).filter(isPersistableFeature) as GeoJSON.Feature[]).features as GeoJSON.Feature[];
      if (nextFeatures.length === 0) return;

      setFeatures(nextFeatures);
      setSaveStatus("dirty");
      if (mapRef.current) {
        fitMapToPoints(mapRef.current, parsed.data);
      }
    } catch (error) {
      console.error("[GeometryEditor] handleApplyFromTextarea failed", error);
      setSaveStatus("error");
      toast("error", "GeoJSON inválido para el editor", "El contenido pudo leerse, pero no pudo aplicarse al mapa.");
    }
  }, [parsed, toast]);

  // ── Apply imported data to Terra Draw + textarea ──────────────────
  const applyImport = useCallback(
    (result: ImportResult) => {
      try {
        const persistableFeatures = normalizeFeatureCollection(result.features.features.filter(isPersistableFeature) as GeoJSON.Feature[]).features as GeoJSON.Feature[];

        const cleaned = featuresToCleanGeoJson(persistableFeatures);
        setFeatures(persistableFeatures);
        setSelectedFeatureId(null);
        setSaveStatus("dirty");
        if (mapRef.current) {
          fitMapToPoints(mapRef.current, cleaned);
        }
      } catch (error) {
        console.error("[GeometryEditor] applyImport failed", error);
        setSaveStatus("error");
        toast("error", "No se pudo importar la geometría", "El archivo fue leído, pero el editor no pudo cargarlo.");
      }
    },
    [toast],
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

  const handleDeleteSelectedFeature = useCallback(() => {
    if (!selectedFeatureId) {
      toast("info", "Nada seleccionado", "Seleccioná un elemento desde el mapa o la lista.");
      return;
    }

    const exists = featuresRef.current.some((feature) => getFeatureId(feature) === selectedFeatureId);
    if (!exists) {
      setSelectedFeatureId(null);
      toast("info", "Nada seleccionado", "La selección ya no existe en el mapa.");
      return;
    }

    markDirtyFeatures((current) => current.filter((feature) => getFeatureId(feature) !== selectedFeatureId));
    setSelectedFeatureId(null);
    toast("success", "Elemento eliminado", "Se quitó la figura seleccionada. Guardá para persistir el cambio.");
  }, [markDirtyFeatures, selectedFeatureId, toast]);

  // ── Set draw mode ────────────────────────────────────────────────
  const handleSetMode = useCallback(
    (mode: DrawMode) => {
      const terraDraw = getTerraDraw();
      if (!terraDraw) return;

      if (mode === "delete-selection") {
        handleDeleteSelectedFeature();
        return;
      }

      terraDraw.setMode(mode);
      setActiveMode(mode);
      window.setTimeout(syncPayloadFromMap, 0);
    },
    [getTerraDraw, handleDeleteSelectedFeature, syncPayloadFromMap],
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

  const updateFeatureProperties = useCallback(
    (id: string, properties: Partial<FeatureMetadata>) => {
      markDirtyFeatures((current) =>
        current.map((feature) => {
          if (getFeatureId(feature) !== id) return feature;
          return {
            ...feature,
            properties: {
              ...(feature.properties ?? {}),
              ...properties,
              updatedAt: new Date().toISOString(),
            },
          };
        }),
      );
    },
    [markDirtyFeatures],
  );

  const selectFeatureFromList = useCallback(
    (id: string) => {
      setSelectedFeatureId(id);
      const feature = findFeatureById(featuresRef.current, id);
      if (feature && mapRef.current) {
        fitMapToPoints(mapRef.current, { type: "FeatureCollection", features: [feature] });
      }
      handleSetMode("select");
    },
    [handleSetMode],
  );

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchResults([]);
      setSearchError("Escribí al menos 3 caracteres.");
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error("No se pudo resolver la búsqueda.");
      }

      const data = (await response.json()) as { results?: GeocodeResult[] };
      setSearchResults(data.results ?? []);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setSearchError(error instanceof Error ? error.message : "Error desconocido");
        setSearchResults([]);
      }
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const focusSearchResult = useCallback((result: GeocodeResult) => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(searchPointSourceId) as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [result.lng, result.lat],
          },
          properties: {
            label: result.displayName,
          },
        },
      ],
    });

    setLastSearchResult(result);
    map.easeTo({ center: [result.lng, result.lat], zoom: 14, duration: 700 });
    toast("info", "Ubicación encontrada", result.displayName);
  }, [toast]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    const map = mapRef.current;
    const source = map?.getSource(searchPointSourceId) as maplibregl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: [],
    });
    setLastSearchResult(null);
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

      if (cleaned.features.length === 0) {
        toast("info", "Sin geometría persistible", "Terminá la figura antes de exportar.");
        return;
      }
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

  const canSaveGeometry = features.length > 0;

  const flushPayloadToForm = useCallback(() => {
    const fc = drawControlRef.current?.getFeatures();
    let nextFeatures = featuresRef.current;
    if (fc) {
      const normalized = normalizeFeatureCollection(fc.features as GeoJSON.Feature[]).features as GeoJSON.Feature[];
      const hiddenOrFiltered = featuresRef.current.filter((feature) => {
        const id = getFeatureId(feature);
        return !id || !visibleFeatureIds.has(id);
      });
      nextFeatures = [...hiddenOrFiltered, ...normalized];
      featuresRef.current = nextFeatures;
      setFeatures(nextFeatures);
    }
    const nextPayload = serializeFeatures(nextFeatures);

    if (geometryPayloadInputRef.current) {
      geometryPayloadInputRef.current.value = nextPayload;
    }

    setPayload(nextPayload);
    setSaveStatus("saving");
  }, [visibleFeatureIds]);

  useEffect(() => {
    if (!selectedFeatureId) return;
    if (!findFeatureById(features, selectedFeatureId)) {
      setSelectedFeatureId(null);
    }
  }, [features, selectedFeatureId]);

  return (
    <form ref={formRef} action={action} onSubmit={flushPayloadToForm} className="space-y-6">
      <input type="hidden" name="flightPlanId" value={flightPlanId} />
      <input ref={geometryPayloadInputRef} type="hidden" name="geometryPayload" value={payload} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,72fr)_minmax(360px,28fr)]">
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

          <div className="relative h-[520px] bg-slate-100 dark:bg-slate-950 sm:h-[640px] xl:h-[calc(100vh-220px)] xl:min-h-[720px]">
            <div ref={containerRef} className="h-full w-full" />
            {/* Contextual hint */}
            <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-lg shadow-slate-950/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/85 dark:text-slate-200">
                <p className="font-semibold text-slate-950 dark:text-white">
                {activeMode
                  ? `Modo: ${DRAW_MODES.find((mode) => mode.id === activeMode)?.label ?? activeMode}`
                  : measurements.featureCount > 0
                    ? `Editor — ${measurements.featureCount} figura${measurements.featureCount !== 1 ? "s" : ""}`
                    : "Siguiente acción"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {measurements.featureCount > 0
                  ? "Usá Seleccionar para mover figuras. Guardá el área operativa antes de salir."
                  : "Elegí Polígono, marcá la zona operativa y guardá el área."}
              </p>
            </div>
            {measurements.featureCount > 0 && (
              <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/90 px-4 py-2 text-xs font-medium text-emerald-700 backdrop-blur dark:bg-emerald-500/10 dark:text-emerald-200">
                <span>Área {measurements.totalArea}</span>
                <span className="mx-1.5 text-emerald-300 dark:text-emerald-400">·</span>
                <span>Perímetro {measurements.totalPerimeter}</span>
              </div>
            )}
            {!parsed.valid && payload.trim() ? (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 backdrop-blur dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                La geometría interna necesita revisión antes de guardar.
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-1">
          <DetailPanel title={title} description={description}>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Acciones principales</p>
                  <StatusChip label={saveStatusLabel} tone={saveStatusTone} />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <SubmitButton
                    label="Guardar cambios del mapa"
                    loadingLabel="Guardando mapa…"
                    disabled={!canSaveGeometry}
                    className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent-strong transition hover:border-accent/50 hover:bg-accent/15 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:border-cyan-300/50 dark:hover:bg-cyan-400/20 dark:disabled:border-slate-800 dark:disabled:bg-slate-950/50 dark:disabled:text-slate-500"
                  />
                  {!canSaveGeometry && (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Dibujá o importá al menos un elemento antes de guardar.
                    </p>
                  )}
                  <Link
                    href={`/flight-plans/${flightPlanId}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Volver al plan de vuelo
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Buscar lugar</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Encontrá una localidad o referencia y centramos el mapa.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSearch();
                      }
                    }}
                    placeholder="Buscar ciudad, localidad o dirección"
                    className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSearch()}
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={searching}
                  >
                    {searching ? "Buscando…" : "Buscar"}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {lastSearchResult ? (
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-100">
                      Último destino: {lastSearchResult.displayName}
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-950/70">
                      Sin destino fijado
                    </span>
                  )}
                  {(searchQuery || searchResults.length > 0 || searchError) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 transition hover:border-cyan-500/30 hover:text-cyan-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-cyan-200"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                {searchError && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{searchError}</p>}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {searchResults.map((result) => (
                      <button
                        key={`${result.source}-${result.displayName}-${result.lat}-${result.lng}`}
                        type="button"
                        onClick={() => focusSearchResult(result)}
                        className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition hover:border-cyan-500/30 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:bg-cyan-500/10"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{result.displayName}</span>
                          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{result.type}</span>
                        </span>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          Ir
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-950/70" role="status" aria-live="polite">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">
                      Resumen operativo
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
                {restrictionConflicts.length > 0 && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    {restrictionConflicts.map((zone) => zone.label).join(" · ")}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800/80 dark:bg-slate-950/70" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Selección actual</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {selectedFeature?.properties && typeof selectedFeature.properties.name === "string"
                        ? selectedFeature.properties.name
                        : selectedFeatureId
                          ? `ID ${selectedFeatureId}`
                          : "Sin figura seleccionada"}
                    </p>
                  </div>
                  <StatusChip label={selectedFeatureId ? "Seleccionada" : "Sin selección"} tone={selectedFeatureId ? "info" : "neutral"} />
                </div>
                {selectedFeature?.properties && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-950/70">
                      Tipo: {String(selectedFeature.properties.entityType ?? "operation-area")}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-800 dark:bg-slate-950/70">
                      Color: {String(selectedFeature.properties.color ?? "—")}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeatureId(null)}
                    disabled={!selectedFeatureId}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Cancelar selección
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedFeature}
                    disabled={!selectedFeatureId}
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-500/30 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20"
                  >
                    Eliminar elemento seleccionado
                  </button>
                </div>
              </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/[0.06]" role="status" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                  Herramientas de dibujo
                </p>
                <p className="mt-1 text-sm font-medium text-cyan-950 dark:text-cyan-50">
                  {measurements.featureCount > 0
                    ? "Seguí refinando la geometría o exportá el resultado final."
                    : "Arrancá con un polígono o importá una referencia operativa."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ToolbarButton
                    active={activeMode === "polygon"}
                    icon="⬠"
                    label="Crear polígono"
                    onClick={() => handleSetMode("polygon")}
                  />
                  <ToolbarButton icon="📂" label="Importar KML/KMZ/DXF" onClick={() => fileInputRef.current?.click()} />
                  {measurements.featureCount > 0 ? (
                    <ToolbarButton icon="⬇" label="Exportar KML" onClick={() => handleExport("kml")} />
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-950/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Figuras activas
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {measurements.featureCount}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-2 dark:border-slate-800/80 dark:bg-slate-950/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      GeoJSON avanzado
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {parsed.valid ? "Válido" : "Revisar"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Measurement panel */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-4 dark:bg-cyan-500/[0.06]">
                <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                  {measurements.featureCount > 0
                    ? `Mediciones en vivo (${measurements.featureCount})`
                    : "Sin mediciones todavía"}
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
                    Dibujá una figura para ver mediciones en vivo.
                  </p>
                )}
              </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Herramientas de operación</p>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {activeMode ? `Activo: ${DRAW_MODES.find((mode) => mode.id === activeMode)?.label ?? activeMode}` : "Esperando herramienta"}
                    </span>
                  </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
                    Crear
                  </span>
                  {DRAW_MODES.filter((m) => m.group === "draw").map((mode) => (
                    <ToolbarButton
                      key={mode.id}
                      active={activeMode === mode.id}
                      icon={mode.icon}
                      label={mode.id === "polygon" ? "Crear polígono" : `Crear ${mode.label.toLowerCase()}`}
                      onClick={() => handleSetMode(mode.id)}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
                    Modificar
                  </span>
                  {DRAW_MODES.filter((m) => m.group === "edit" && m.id !== "delete-selection").map((mode) => (
                    <ToolbarButton
                      key={mode.id}
                      active={activeMode === mode.id}
                      icon={mode.icon}
                      label={mode.id === "select" ? "Seleccionar en mapa" : mode.label}
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
                    label={importing ? "Importando..." : "Importar KML/KMZ/DXF"}
                    onClick={() => fileInputRef.current?.click()}
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3 dark:border-slate-800/80 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Elementos del mapa</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{visibleFeatures.length}/{features.length} visibles</span>
                  </div>
                  {features.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                      Todavía no hay elementos. Creá un polígono o importá un archivo para empezar.
                    </p>
                  ) : (
                    <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                      {features.map((feature) => {
                        const id = getFeatureId(feature) ?? "";
                        const entityType = getFeatureEntityType(feature);
                        const visible = getFeatureVisible(feature);
                        const isSelected = selectedFeatureId === id;
                        const props = (feature.properties ?? {}) as Record<string, unknown>;
                        return (
                          <div
                            key={id}
                            className={`space-y-3 rounded-2xl border p-3 transition ${
                              isSelected
                                ? "border-cyan-500/40 bg-cyan-50/80 dark:border-cyan-400/40 dark:bg-cyan-500/10"
                                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/70"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className="mt-2 h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: typeof props.color === "string" ? props.color : ENTITY_COLORS[entityType] }}
                                aria-hidden="true"
                              />
                              <label className="min-w-0 flex-1 space-y-1">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">Nombre</span>
                                <input
                                  value={getFeatureName(feature)}
                                  onChange={(event) => updateFeatureProperties(id, { name: event.target.value })}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                                />
                              </label>
                            </div>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <select
                                value={entityType}
                                onChange={(event) => updateFeatureProperties(id, { entityType: event.target.value as EntityType, color: ENTITY_COLORS[event.target.value as EntityType] })}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                              >
                                <option value="operation-area">Área de operación</option>
                                <option value="reference">Referencia importada</option>
                                <option value="obstacle">Obstáculo</option>
                                <option value="note">Nota</option>
                              </select>
                              <input
                                type="color"
                                value={typeof props.color === "string" ? props.color : ENTITY_COLORS[entityType]}
                                onChange={(event) => updateFeatureProperties(id, { color: event.target.value })}
                                aria-label={`Color de ${getFeatureName(feature)}`}
                                className="h-9 w-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => selectFeatureFromList(id)}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-cyan-500/30 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-cyan-500/10"
                              >
                                Seleccionar
                              </button>
                              <button
                                type="button"
                                onClick={() => updateFeatureProperties(id, { visible: !visible })}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-cyan-500/30 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-cyan-500/10"
                              >
                                {visible ? "Ocultar" : "Mostrar"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFeatureId(id);
                                  markDirtyFeatures((current) => current.filter((item) => getFeatureId(item) !== id));
                                  toast("success", "Elemento eliminado", "Guardá el mapa para persistir el cambio.");
                                }}
                                className="inline-flex items-center justify-center rounded-xl border border-rose-500/20 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-500/30 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-3 dark:border-slate-800/80 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Capas operativas</p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">
                      {enabledLayerCount}/4 capas visibles
                    </span>
                  </div>

                  {[
                    { key: "satellite" as const, label: "Mapa base", desc: "Imagen satelital de referencia", count: null },
                    { key: "operation-area" as const, label: "Áreas de operación", desc: "Polígonos principales del plan", count: featureCounts["operation-area"] },
                    { key: "reference" as const, label: "Referencias importadas", desc: "KML, KMZ, DXF o líneas de apoyo", count: featureCounts.reference },
                    { key: "obstacle" as const, label: "Obstáculos", desc: "Zonas o puntos de riesgo", count: featureCounts.obstacle },
                    { key: "note" as const, label: "Notas", desc: "Puntos de referencia operativa", count: featureCounts.note },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleLayerToggle(item.key)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-left transition hover:border-cyan-500/30 hover:bg-white dark:border-slate-800 dark:bg-slate-950/80 dark:hover:border-cyan-500/30"
                    >
                      <span>
                        <span className="block text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-500">
                          {item.desc}
                          {item.count ? ` · ${item.count.visible}/${item.count.total} visibles` : ""}
                        </span>
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

            </div>
          </DetailPanel>

          <DetailPanel title="Exportación avanzada" description="Opciones secundarias para CAD/GIS y soporte avanzado.">
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

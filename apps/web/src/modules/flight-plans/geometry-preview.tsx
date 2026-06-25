"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

/**
 * Extract all [lng, lat] coordinate pairs from any GeoJSON geometry.
 */
function extractCoordinates(geometry: GeoJSON.Geometry): Array<[number, number]> {
  const result: Array<[number, number]> = [];

  function walk(value: unknown) {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
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

/** Safely parse a string as GeoJSON FeatureCollection. */
function parseGeoJson(text: string): GeoJSON.FeatureCollection | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    const d = parsed as Record<string, unknown>;

    if (d.type === "FeatureCollection" && Array.isArray(d.features)) {
      return d as unknown as GeoJSON.FeatureCollection;
    }
    if (d.type === "Feature") {
      return { type: "FeatureCollection", features: [d as unknown as GeoJSON.Feature] };
    }
    if (
      typeof d.type === "string" &&
      ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"].includes(
        d.type,
      )
    ) {
      return {
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: d as unknown as GeoJSON.Geometry, properties: {} }],
      };
    }
    return null;
  } catch {
    return null;
  }
}

type GeometryPreviewProps = {
  /** Raw GeoJSON string to render on the map. */
  payload: string;
  /** Height of the map container. */
  height?: number;
};

/**
 * Read-only map preview for the creation wizard.
 * Renders a small satellite map with the provided GeoJSON geometry.
 * No drawing tools, no editing — just visual feedback.
 */
export function GeometryPreview({ payload, height = 200 }: GeometryPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const sourceAddedRef = useRef(false);

  const fc = parseGeoJson(payload);

  // ── Initialise map (once) ──────────────────────────────────
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
            attribution: "Esri, Maxar, Earthstar Geographics",
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
      attributionControl: false,
    });

    map.on("load", () => {
      applyGeoJson(map, fc);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      sourceAddedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update layer when payload changes ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("style.load", () => applyGeoJson(map, fc));
      return;
    }

    applyGeoJson(map, fc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  function applyGeoJson(map: maplibregl.Map, data: GeoJSON.FeatureCollection | null) {
    // Remove existing layer + source
    if (map.getLayer("preview-geometry")) map.removeLayer("preview-geometry");
    if (map.getSource("preview-geometry")) map.removeSource("preview-geometry");

    if (!data || data.features.length === 0) {
      map.easeTo({ center: [-70.6693, -33.4489], zoom: 4, duration: 300 });
      return;
    }

    map.addSource("preview-geometry", { type: "geojson", data });
    map.addLayer({
      id: "preview-geometry",
      type: "fill",
      source: "preview-geometry",
      paint: {
        "fill-color": "#22d3ee",
        "fill-opacity": 0.15,
      },
    });
    map.addLayer({
      id: "preview-geometry-outline",
      type: "line",
      source: "preview-geometry",
      paint: {
        "line-color": "#22d3ee",
        "line-width": 2,
        "line-opacity": 0.7,
      },
    });

    // Fit bounds
    const points: Array<[number, number]> = [];
    for (const feature of data.features) {
      if (feature.geometry) {
        points.push(...extractCoordinates(feature.geometry));
      }
    }

    if (points.length > 0) {
      let minLng = points[0][0],
        maxLng = points[0][0];
      let minLat = points[0][1],
        maxLat = points[0][1];
      for (const [lng, lat] of points) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 32, duration: 300 },
      );
    }

    sourceAddedRef.current = true;
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80"
      style={{ height }}
    />
  );
}

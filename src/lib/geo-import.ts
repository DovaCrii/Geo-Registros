/**
 * geo-import.ts
 *
 * Client-side importers that parse KML/DXF files into GeoJSON FeatureCollections.
 * All run in the browser via client components.
 */

import { kml } from "@tmcw/togeojson";

/* ------------------------------------------------------------------ */
/*  Result type                                                        */
/* ------------------------------------------------------------------ */

export interface ImportResult {
  features: GeoJSON.FeatureCollection;
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  KML → GeoJSON                                                      */
/* ------------------------------------------------------------------ */

/**
 * Parse a KML string into a GeoJSON FeatureCollection.
 * Uses @tmcw/togeojson under the hood (5 KB, zero deps).
 */
export function importKml(text: string): ImportResult {
  const dom = new DOMParser().parseFromString(text, "text/xml");
  const raw = kml(dom);
  // kml() types return Geometry | null; filter out null geometries
  const fc: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: raw.features.filter(
      (f): f is GeoJSON.Feature => f.geometry !== null,
    ),
  };
  const count = fc.features.length;

  return {
    features: fc,
    summary: count === 1 ? "1 KML feature" : `${count} KML features`,
  };
}

/* ------------------------------------------------------------------ */
/*  DXF → GeoJSON                                                      */
/* ------------------------------------------------------------------ */

// GeoJSON helper factories (no turf dependency needed)
function point(coords: [number, number]): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: coords },
    properties: {},
  };
}

function lineString(
  coords: Array<[number, number]>,
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: coords },
    properties: {},
  };
}

function polygon(
  rings: Array<Array<[number, number]>>,
): GeoJSON.Feature<GeoJSON.Polygon> {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: rings },
    properties: {},
  };
}

/** Approximate a circle as a 64-vertex polygon (closed ring). */
function circleToPolygon(
  cx: number,
  cy: number,
  radius: number,
  segments = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    ring.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return polygon([ring]);
}

/** Approximate a DXF ARC (center + radius + start/end angles) as a LineString. */
function arcToLineString(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  segments = 32,
): GeoJSON.Feature<GeoJSON.LineString> {
  const totalAngle = endAngle - startAngle;
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (totalAngle * i) / segments;
    coords.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return lineString(coords);
}

function isFeatureClosed(
  vertices: Array<{ x: number; y: number }>,
): boolean {
  if (vertices.length < 3) return false;
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  // DXF uses floating point equality — within a small tolerance is closed
  const EPS = 1e-8;
  return (
    Math.abs(first.x - last.x) < EPS && Math.abs(first.y - last.y) < EPS
  );
}

/** Convert a single DXF entity to a GeoJSON Feature (or null if unsupported). */
function dxfEntityToGeoJson(entity: Record<string, unknown>): GeoJSON.Feature | null {
  const type = entity.type as string;

  switch (type) {
    /* ---- POINT ---- */
    case "POINT": {
      const pos = entity.position as { x: number; y: number } | undefined;
      if (!pos) return null;
      return point([pos.x, pos.y]);
    }

    /* ---- LINE ---- */
    case "LINE": {
      const vertices = entity.vertices as
        | Array<{ x: number; y: number }>
        | undefined;
      if (!vertices || vertices.length < 2) return null;
      const coords = vertices.map((v) => [v.x, v.y] as [number, number]);
      return lineString(coords);
    }

    /* ---- LWPOLYLINE / POLYLINE ---- */
    case "LWPOLYLINE":
    case "POLYLINE": {
      const rawVertices = entity.vertices as
        | Array<{ x: number; y: number }>
        | undefined;
      if (!rawVertices || rawVertices.length < 2) return null;

      let closed =
        (entity.closed as boolean) ||
        (entity.shape as boolean) ||
        isFeatureClosed(rawVertices);

      const coords = rawVertices.map(
        (v) => [v.x, v.y] as [number, number],
      );

      if (closed && coords.length >= 3) {
        // Ensure the ring is explicitly closed for GeoJSON
        const last = coords[coords.length - 1];
        if (last[0] !== coords[0][0] || last[1] !== coords[0][1]) {
          coords.push([coords[0][0], coords[0][1]]);
        }
        return polygon([coords]);
      }

      return lineString(coords);
    }

    /* ---- CIRCLE (→ polygon approximation) ---- */
    case "CIRCLE": {
      const center = entity.center as { x: number; y: number } | undefined;
      const radius = entity.radius as number | undefined;
      if (!center || !radius || radius <= 0) return null;
      return circleToPolygon(center.x, center.y, radius);
    }

    /* ---- ARC (→ line string approximation) ---- */
    case "ARC": {
      const centerArc = entity.center as
        | { x: number; y: number }
        | undefined;
      const radiusArc = entity.radius as number | undefined;
      const startAngle = (entity.startAngle as number) ?? 0;
      const endAngle = (entity.endAngle as number) ?? 0;
      if (!centerArc || !radiusArc || radiusArc <= 0) return null;
      // DXF angles are in degrees → convert to radians
      return arcToLineString(
        centerArc.x,
        centerArc.y,
        radiusArc,
        (startAngle * Math.PI) / 180,
        (endAngle * Math.PI) / 180,
      );
    }

    default:
      // Unsupported entity — skip silently
      return null;
  }
}

/**
 * Parse a DXF string into a GeoJSON FeatureCollection.
 *
 * Supported entities: POINT, LINE, LWPOLYLINE, POLYLINE, CIRCLE, ARC.
 * All other entities are silently skipped.
 */
export function importDxf(text: string): ImportResult {
  // Dynamic import so we only pay for the parser when it is actually used
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DxfParser = require("dxf-parser") as new () => {
    parseSync: (input: string) => {
      entities: Array<Record<string, unknown>>;
    };
  };
  const parser = new DxfParser();
  const data = parser.parseSync(text);
  const features: GeoJSON.Feature[] = [];
  let skipped = 0;

  for (const entity of data.entities) {
    const feature = dxfEntityToGeoJson(entity);
    if (feature) {
      features.push(feature);
    } else {
      skipped++;
    }
  }

  const count = features.length;
  let summary: string;

  if (count === 0 && skipped > 0) {
    summary = `${skipped} unsupported DXF entities (skipped)`;
  } else if (count === 0) {
    summary = "No supported entities found in DXF";
  } else {
    summary = `${count} DXF entit${count === 1 ? "y" : "ies"} converted`;
    if (skipped > 0) {
      summary += ` (${skipped} skipped)`;
    }
  }

  return {
    features: { type: "FeatureCollection", features },
    summary,
  };
}

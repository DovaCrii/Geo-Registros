/**
 * geo-export.ts
 *
 * Client-side exporters that convert GeoJSON FeatureCollections into
 * KML or DXF string output (suitable for file download).
 */

import DxfWriter from "dxf-writer";
import tokml from "tokml";

/* ------------------------------------------------------------------ */
/*  GeoJSON type helper                                                */
/* ------------------------------------------------------------------ */

type Coord = [number, number];

/* ------------------------------------------------------------------ */
/*  GeoJSON → KML                                                      */
/* ------------------------------------------------------------------ */

/**
 * Convert a GeoJSON FeatureCollection to a KML string.
 *
 * Uses tokml under the hood (5 KB, zero deps).
 */
export function exportKml(fc: GeoJSON.FeatureCollection): string {
  return tokml(fc);
}

/* ------------------------------------------------------------------ */
/*  GeoJSON → DXF                                                      */
/* ------------------------------------------------------------------ */

/**
 * Convert a GeoJSON FeatureCollection to a DXF string (R12 ASCII DXF).
 *
 * Uses dxf-writer under the hood.
 *
 * Supported geometry types: Point, MultiPoint, LineString, MultiLineString,
 * Polygon, MultiPolygon. Nested GeometryCollections are unwrapped.
 */
export function exportDxf(fc: GeoJSON.FeatureCollection): string {
  const dxf = new DxfWriter();

  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    writeGeometry(dxf, feature.geometry);
  }

  return dxf.toDxfString();
}

/** Write a single GeoJSON geometry object to the DXF drawing. */
function writeGeometry(dxf: DxfWriter, geometry: GeoJSON.Geometry): void {
  switch (geometry.type) {
    /* ---- Point ---- */
    case "Point": {
      const [x, y] = geometry.coordinates as unknown as Coord;
      dxf.drawPoint(x, y);
      break;
    }

    /* ---- MultiPoint ---- */
    case "MultiPoint": {
      const points = geometry.coordinates as unknown as Coord[];
      for (const [x, y] of points) {
        dxf.drawPoint(x, y);
      }
      break;
    }

    /* ---- LineString ---- */
    case "LineString": {
      const coords = geometry.coordinates as unknown as Coord[];
      const pts = coords.map(([x, y]) => [x, y] as [number, number]);
      dxf.drawPolyline(pts, false);
      break;
    }

    /* ---- MultiLineString ---- */
    case "MultiLineString": {
      const lines = geometry.coordinates as unknown as Coord[][];
      for (const line of lines) {
        const pts = line.map(([x, y]) => [x, y] as [number, number]);
        dxf.drawPolyline(pts, false);
      }
      break;
    }

    /* ---- Polygon ---- */
    case "Polygon": {
      const rings = geometry.coordinates as unknown as Coord[][];
      // Only the exterior ring is exported (interior rings/holes are not
      // universally supported in CAD polyline semantics)
      const exterior = rings[0];
      const pts = exterior.map(([x, y]) => [x, y] as [number, number]);
      dxf.drawPolyline(pts, true);
      break;
    }

    /* ---- MultiPolygon ---- */
    case "MultiPolygon": {
      const polygons = geometry.coordinates as unknown as Coord[][][];
      for (const polygon of polygons) {
        const exterior = polygon[0];
        const pts = exterior.map(([x, y]) => [x, y] as [number, number]);
        dxf.drawPolyline(pts, true);
      }
      break;
    }

    /* ---- GeometryCollection ---- */
    case "GeometryCollection": {
      const geometries = (geometry as GeoJSON.GeometryCollection).geometries;
      for (const g of geometries) {
        writeGeometry(dxf, g);
      }
      break;
    }

    /* -- Unsupported -- */
    default:
      break;
  }
}

type BBox = [number, number, number, number];

export type GeoRestrictionAlert = {
  id: string;
  label: string;
  description: string;
};

type RestrictionZone = GeoRestrictionAlert & {
  bbox: BBox;
};

const RESTRICTED_ZONES: RestrictionZone[] = [
  {
    id: "santiago-airport-demo",
    label: "Zona restringida · entorno aeropuerto",
    description: "Referencia preventiva para el entorno metropolitano.",
    bbox: [-70.9, -33.72, -70.55, -33.35],
  },
  {
    id: "coastal-test-demo",
    label: "Zona restringida · franja costera demo",
    description: "Área de ejemplo para alertas operativas durante el trazado.",
    bbox: [-71.05, -33.2, -70.65, -32.95],
  },
];

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

function bboxFromPoints(points: Array<[number, number]>): BBox | null {
  if (points.length === 0) return null;

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

  return [minLng, minLat, maxLng, maxLat];
}

function overlaps(a: BBox, b: BBox): boolean {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

function normalizeToGeometries(data: unknown): GeoJSON.Geometry[] {
  if (!data || typeof data !== "object") return [];

  const d = data as Record<string, unknown>;

  if (d.type === "FeatureCollection" && Array.isArray(d.features)) {
    return d.features.flatMap((feature) => {
      const f = feature as GeoJSON.Feature;
      return f.geometry ? [f.geometry] : [];
    });
  }

  if (d.type === "Feature") {
    return d.geometry ? [d.geometry as GeoJSON.Geometry] : [];
  }

  if (typeof d.type === "string") {
    const geometryTypes = [
      "Point",
      "MultiPoint",
      "LineString",
      "MultiLineString",
      "Polygon",
      "MultiPolygon",
      "GeometryCollection",
    ];

    if (geometryTypes.includes(d.type)) {
      return [d as unknown as GeoJSON.Geometry];
    }
  }

  return [];
}

export function evaluateRestrictedZoneAlert(data: unknown): GeoRestrictionAlert | null {
  const geometries = normalizeToGeometries(data);
  if (geometries.length === 0) return null;

  for (const geometry of geometries) {
    const points = extractCoordinates(geometry);
    const bbox = bboxFromPoints(points);
    if (!bbox) continue;

    for (const zone of RESTRICTED_ZONES) {
      if (overlaps(bbox, zone.bbox)) {
        return {
          id: zone.id,
          label: zone.label,
          description: zone.description,
        };
      }
    }
  }

  return null;
}

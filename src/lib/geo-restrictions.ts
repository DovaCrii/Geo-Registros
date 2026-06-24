type Point = [number, number];

export type GeoRestriction = {
  id: string;
  label: string;
  description: string;
  bounds: [Point, Point];
};

const RESTRICTED_ZONES: GeoRestriction[] = [
  {
    id: "rm-santiago",
    label: "Zona metropolitana sensible",
    description: "Revisá el área antes de guardar o exportar.",
    bounds: [
      [-70.95, -33.68],
      [-70.45, -33.28],
    ],
  },
  {
    id: "valparaiso-coast",
    label: "Corredor costero sensible",
    description: "Asegurá respaldo operativo antes de continuar.",
    bounds: [
      [-71.92, -33.15],
      [-71.32, -32.72],
    ],
  },
];

function extractPoints(value: unknown, points: Point[] = []): Point[] {
  if (!Array.isArray(value)) return points;

  if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    points.push([value[0], value[1]]);
    return points;
  }

  for (const child of value) {
    extractPoints(child, points);
  }

  return points;
}

function toFeaturePoints(data: unknown): Point[] {
  if (!data || typeof data !== "object") return [];

  const root = data as Record<string, unknown>;

  if (root.type === "FeatureCollection" && Array.isArray(root.features)) {
    return root.features.flatMap((feature) => toFeaturePoints(feature));
  }

  if (root.type === "Feature" && root.geometry && typeof root.geometry === "object") {
    return toFeaturePoints(root.geometry);
  }

  if (typeof root.type === "string" && "coordinates" in root) {
    return extractPoints(root.coordinates);
  }

  if (root.type === "GeometryCollection" && Array.isArray(root.geometries)) {
    return root.geometries.flatMap((geometry) => toFeaturePoints(geometry));
  }

  return [];
}

function pointInBounds(point: Point, bounds: [Point, Point]): boolean {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const [lng, lat] = point;
  return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
}

export function findGeoRestrictionConflicts(data: unknown): GeoRestriction[] {
  const points = toFeaturePoints(data);
  if (points.length === 0) return [];

  return RESTRICTED_ZONES.filter((zone) => points.some((point) => pointInBounds(point, zone.bounds)));
}

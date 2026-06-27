/**
 * Geo-restriction zones for AeroFlow.
 *
 * In production these would come from an API or database. For now we include
 * a small set of simulated restricted zones near major Chilean airports to
 * demonstrate the intersection alert mechanism.
 */

export type RestrictedZone = {
  id: string;
  name: string;
  /** Severity level. */
  severity: "no-fly" | "caution";
  /** Description of the restriction. */
  description: string;
  /** Polygon boundary as GeoJSON coordinates [lng, lat][]. */
  polygon: Array<[number, number]>;
};

/**
 * Known restricted zones (simulated).
 * Coordinates are approximate bounding boxes near Chilean airports.
 */
export const RESTRICTED_ZONES: RestrictedZone[] = [
  {
    id: "scl-airport",
    name: "Zona Aeropuerto Arturo Merino Benítez (SCL)",
    severity: "no-fly",
    description:
      "Zona de exclusión aérea del Aeropuerto Internacional de Santiago. Prohibido el vuelo de RPAS sin autorización DGAC especial.",
    polygon: [
      [-70.82, -33.36],
      [-70.82, -33.42],
      [-70.72, -33.42],
      [-70.72, -33.36],
      [-70.82, -33.36],
    ],
  },
  {
    id: "scl-approach",
    name: "Sendas de aproximación SCL",
    severity: "caution",
    description:
      "Corredor de aproximación al Aeropuerto de Santiago. Vuelo permitido solo por debajo de 50 metros AGL con notificación previa.",
    polygon: [
      [-70.95, -33.38],
      [-70.95, -33.44],
      [-70.82, -33.44],
      [-70.82, -33.38],
      [-70.95, -33.38],
    ],
  },
  {
    id: "anf-airport",
    name: "Zona Aeropuerto Cerro Moreno (ANF)",
    severity: "no-fly",
    description:
      "Zona de exclusión del Aeropuerto Internacional Andrés Sabella Gálvez, Antofagasta.",
    polygon: [
      [-70.5, -23.42],
      [-70.5, -23.48],
      [-70.4, -23.48],
      [-70.4, -23.42],
      [-70.5, -23.42],
    ],
  },
  {
    id: "presidential",
    name: "Zona Palacio de La Moneda",
    severity: "no-fly",
    description:
      "Zona de exclusión aérea sobre el Palacio de Gobierno y perímetro inmediato. Prohibido el vuelo de RPAS en todo momento.",
    polygon: [
      [-70.658, -33.44],
      [-70.658, -33.446],
      [-70.648, -33.446],
      [-70.648, -33.44],
      [-70.658, -33.44],
    ],
  },
  {
    id: "national-park",
    name: "Parque Nacional Torres del Paine",
    severity: "caution",
    description:
      "Zona de conservación. El vuelo de RPAS requiere autorización de CONAF y no debe interferir con fauna ni visitantes.",
    polygon: [
      [-73.2, -50.95],
      [-73.2, -51.2],
      [-72.8, -51.2],
      [-72.8, -50.95],
      [-73.2, -50.95],
    ],
  },
];

/**
 * Simple point-in-polygon test using ray casting.
 */
function pointInPolygon(
  point: [number, number],
  polygon: Array<[number, number]>,
): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Check if a GeoJSON polygon intersects any restricted zone.
 * Uses a simple centroid check for performance. In production this would
 * use a proper polygon intersection algorithm.
 */
export function checkRestrictionIntersection(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
): RestrictedZone[] {
  const hits: RestrictedZone[] = [];

  // Collect all coordinates to test
  const coords: Array<[number, number]> = [];
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) {
      for (const coord of ring) {
        coords.push(coord as [number, number]);
      }
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) {
          coords.push(coord as [number, number]);
        }
      }
    }
  }

  if (coords.length === 0) return hits;

  // Calculate centroid
  const centroid: [number, number] = [
    coords.reduce((sum, c) => sum + c[0], 0) / coords.length,
    coords.reduce((sum, c) => sum + c[1], 0) / coords.length,
  ];

  // Check centroid against each restricted zone
  for (const zone of RESTRICTED_ZONES) {
    if (pointInPolygon(centroid, zone.polygon)) {
      hits.push(zone);
    }
  }

  return hits;
}

/**
 * Get all restricted zones as a GeoJSON FeatureCollection for map rendering.
 */
export function getRestrictionsGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: RESTRICTED_ZONES.map((zone) => ({
      type: "Feature",
      properties: {
        id: zone.id,
        name: zone.name,
        severity: zone.severity,
        description: zone.description,
      },
      geometry: {
        type: "Polygon",
        coordinates: [zone.polygon],
      },
    })),
  };
}

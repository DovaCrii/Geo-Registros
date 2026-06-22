import { describe, expect, it } from "vitest";

import { evaluateRestrictedZoneAlert } from "@/lib/geo-restrictions";

describe("evaluateRestrictedZoneAlert", () => {
  it("returns null for empty input", () => {
    expect(evaluateRestrictedZoneAlert(null)).toBeNull();
    expect(evaluateRestrictedZoneAlert(undefined)).toBeNull();
    expect(evaluateRestrictedZoneAlert({})).toBeNull();
  });

  it("detects a polygon that overlaps the demo restricted zone", () => {
    const alert = evaluateRestrictedZoneAlert({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-70.8, -33.7],
          [-70.6, -33.7],
          [-70.6, -33.5],
          [-70.8, -33.5],
          [-70.8, -33.7],
        ]],
      },
    });

    expect(alert).toEqual(
      expect.objectContaining({
        id: "santiago-airport-demo",
        label: "Zona restringida · entorno aeropuerto",
      }),
    );
  });

  it("returns null for geometry outside the demo zones", () => {
    const alert = evaluateRestrictedZoneAlert({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-72.4, -35.8],
          [-72.1, -35.8],
          [-72.1, -35.5],
          [-72.4, -35.5],
          [-72.4, -35.8],
        ]],
      },
    });

    expect(alert).toBeNull();
  });

  it("supports feature collections", () => {
    const alert = evaluateRestrictedZoneAlert({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-72.2, -35.7],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [-70.7, -33.6],
          },
        },
      ],
    });

    expect(alert?.id).toBe("santiago-airport-demo");
  });
});

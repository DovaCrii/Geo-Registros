import { describe, expect, it } from "vitest";

import { findGeoRestrictionConflicts } from "@/lib/geo-restrictions";

describe("findGeoRestrictionConflicts", () => {
  it("detects a restriction when a point falls inside a zone", () => {
    const conflicts = findGeoRestrictionConflicts({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [-70.7, -33.45] },
          properties: {},
        },
      ],
    });

    expect(conflicts.map((zone) => zone.id)).toContain("rm-santiago");
  });

  it("returns no conflicts for geometry outside the sample zones", () => {
    const conflicts = findGeoRestrictionConflicts({
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.05, -36.83] },
      properties: {},
    });

    expect(conflicts).toEqual([]);
  });
});

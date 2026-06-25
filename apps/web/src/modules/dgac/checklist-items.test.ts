import { describe, expect, it } from "vitest";

import { evaluateChecklistSubmission, normalizeChecklist } from "./checklist-items";

const baseSource = {
  record: {
    clientId: "client-1",
    costCenterId: "cc-1",
    droneId: "drone-1",
    operatorId: "operator-1",
    geometryJson: { type: "Point", coordinates: [-70.66, -33.45] },
    operationDate: new Date("2026-06-16T12:00:00.000Z"),
  },
  documents: [{ id: "doc-1" }],
  drone: { insuranceExpiry: new Date("2027-01-01T00:00:00.000Z") },
  operator: { licenseNumber: "LIC-001", licenseExpiry: new Date("2027-01-01T00:00:00.000Z") },
  weatherReady: true,
} as const;

describe("evaluateChecklistSubmission", () => {
  it("allows submission when checklist and data are complete", () => {
    const persisted = normalizeChecklist({
      "drone-registered": true,
      "operator-valid": true,
      "client-assigned": true,
      "costcenter-assigned": true,
      "operation-area": true,
      "date-defined": true,
      "population-check": true,
      "documents-attached": true,
      "weather-check": true,
      "restriction-check": true,
      "ready-to-send": true,
    });

    const review = evaluateChecklistSubmission(baseSource, persisted);

    expect(review.canSubmit).toBe(true);
    expect(review.missingItems).toHaveLength(0);
  });

  it("blocks submission when automated data is missing", () => {
    const review = evaluateChecklistSubmission(
      {
        ...baseSource,
        drone: { insuranceExpiry: new Date("2020-01-01T00:00:00.000Z") },
      },
      normalizeChecklist({
        "drone-registered": true,
        "operator-valid": true,
        "client-assigned": true,
        "costcenter-assigned": true,
        "operation-area": true,
        "date-defined": true,
        "population-check": true,
        "documents-attached": true,
        "weather-check": true,
        "restriction-check": true,
        "ready-to-send": true,
      }),
    );

    expect(review.canSubmit).toBe(false);
    expect(review.missingItems.map((item) => item.id)).toContain("drone-registered");
  });

  it("blocks submission when manual review flags are missing", () => {
    const review = evaluateChecklistSubmission(
      baseSource,
      normalizeChecklist({
        "drone-registered": true,
        "operator-valid": true,
        "client-assigned": true,
        "costcenter-assigned": true,
        "operation-area": true,
        "date-defined": true,
        "documents-attached": true,
        "weather-check": true,
        "ready-to-send": true,
      }),
    );

    expect(review.canSubmit).toBe(false);
    expect(review.missingItems.map((item) => item.id)).toEqual(
      expect.arrayContaining(["population-check", "restriction-check"]),
    );
  });
});

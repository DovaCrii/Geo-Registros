import { describe, expect, it } from "vitest";
import {
  deriveChecklistState,
  evaluateChecklistSubmission,
  normalizeChecklist,
  normalizeChecklistPatch,
} from "./checklist-items";

// ─── normalizeChecklist ──────────────────────────────────

describe("normalizeChecklist", () => {
  it("returns {} for null", () => {
    expect(normalizeChecklist(null)).toEqual({});
  });

  it("returns {} for undefined", () => {
    expect(normalizeChecklist(undefined)).toEqual({});
  });

  it("returns {} for number", () => {
    expect(normalizeChecklist(42)).toEqual({});
  });

  it("returns {} for string", () => {
    expect(normalizeChecklist("invalid")).toEqual({});
  });

  it("returns {} for array", () => {
    expect(normalizeChecklist(["drone-registered", true])).toEqual({});
  });

  it("returns all items as false for empty object", () => {
    const result = normalizeChecklist({});
    expect(Object.keys(result)).toHaveLength(11);
    expect(Object.values(result).every((v) => v === false)).toBe(true);
  });

  it("preserves only true values, ignores non-boolean truthy", () => {
    const result = normalizeChecklist({
      "drone-registered": true,
      "operator-valid": 1,
      "client-assigned": "yes",
    });
    expect(result["drone-registered"]).toBe(true);
    expect(result["operator-valid"]).toBe(false);
    expect(result["client-assigned"]).toBe(false);
  });

  it("ignores unknown keys not in the checklist", () => {
    const result = normalizeChecklist({
      "drone-registered": true,
      "fake-item": true,
    });
    expect(result).not.toHaveProperty("fake-item");
    expect(result["drone-registered"]).toBe(true);
  });
});

// ─── normalizeChecklistPatch ─────────────────────────────

describe("normalizeChecklistPatch", () => {
  it("returns {} for null", () => {
    expect(normalizeChecklistPatch(null)).toEqual({});
  });

  it("returns only the keys present in input", () => {
    const result = normalizeChecklistPatch({
      "drone-registered": true,
    });
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["drone-registered"]).toBe(true);
  });

  it("treats non-true values as false", () => {
    const result = normalizeChecklistPatch({
      "drone-registered": "yes",
      "operator-valid": false,
    });
    expect(result["drone-registered"]).toBe(false);
    expect(result["operator-valid"]).toBe(false);
  });
});

// ─── deriveChecklistState ────────────────────────────────

const validSource = {
  record: {
    clientId: "client-1",
    costCenterId: "cc-1",
    droneId: "drone-1",
    operatorId: "op-1",
    geometryJson: { type: "Point", coordinates: [-70, -33] },
    operationDate: new Date("2026-07-01"),
  },
  documents: [{ id: "doc-1" }],
  drone: { insuranceExpiry: new Date("2027-01-01") },
  operator: { licenseNumber: "LIC-001", licenseExpiry: new Date("2027-01-01") },
  weatherReady: true,
} as const;

describe("deriveChecklistState", () => {
  it("sets all automated checks to true for valid source", () => {
    const state = deriveChecklistState(validSource);
    expect(state["drone-registered"]).toBe(true);
    expect(state["operator-valid"]).toBe(true);
    expect(state["client-assigned"]).toBe(true);
    expect(state["costcenter-assigned"]).toBe(true);
    expect(state["operation-area"]).toBe(true);
    expect(state["date-defined"]).toBe(true);
    expect(state["documents-attached"]).toBe(true);
    expect(state["weather-check"]).toBe(true);
  });

  it("manual checks start as false", () => {
    const state = deriveChecklistState(validSource);
    expect(state["population-check"]).toBe(false);
    expect(state["restriction-check"]).toBe(false);
  });

  it("sets drone-registered to false when insurance is expired", () => {
    const source = {
      ...validSource,
      drone: { insuranceExpiry: new Date("2020-01-01") },
    };
    const state = deriveChecklistState(source as typeof validSource);
    expect(state["drone-registered"]).toBe(false);
  });

  it("sets drone-registered to false when drone is missing", () => {
    const source = {
      ...validSource,
      record: { ...validSource.record, droneId: "" },
    };
    const state = deriveChecklistState(source);
    expect(state["drone-registered"]).toBe(false);
  });

  it("sets operator-valid to false when license is expired", () => {
    const source = {
      ...validSource,
      operator: { licenseNumber: "LIC-001", licenseExpiry: new Date("2020-01-01") },
    };
    const state = deriveChecklistState(source as typeof validSource);
    expect(state["operator-valid"]).toBe(false);
  });

  it("sets operator-valid to false when operator is missing", () => {
    const source = {
      ...validSource,
      record: { ...validSource.record, operatorId: "" },
    };
    const state = deriveChecklistState(source);
    expect(state["operator-valid"]).toBe(false);
  });

  it("sets documents-attached to false when documents are empty", () => {
    const source = { ...validSource, documents: [] };
    const state = deriveChecklistState(source);
    expect(state["documents-attached"]).toBe(false);
  });

  it("sets weather-check to false when weather is not ready", () => {
    const source = { ...validSource, weatherReady: false };
    const state = deriveChecklistState(source);
    expect(state["weather-check"]).toBe(false);
  });

  it("sets ready-to-send to false when any automated check fails", () => {
    const source = {
      ...validSource,
      drone: { insuranceExpiry: new Date("2020-01-01") },
    };
    const state = deriveChecklistState(source as typeof validSource);
    expect(state["ready-to-send"]).toBe(false);
  });

  it("handles null drone gracefully", () => {
    const source = { ...validSource, drone: null };
    const state = deriveChecklistState(source);
    expect(state["drone-registered"]).toBe(false);
  });

  it("handles null operator gracefully", () => {
    const source = { ...validSource, operator: null };
    const state = deriveChecklistState(source);
    expect(state["operator-valid"]).toBe(false);
  });

  it("handles null insuranceExpiry gracefully", () => {
    const source = {
      ...validSource,
      drone: { insuranceExpiry: null },
    };
    const state = deriveChecklistState(source);
    expect(state["drone-registered"]).toBe(false);
  });
});

// ─── evaluateChecklistSubmission ─────────────────────────

describe("evaluateChecklistSubmission", () => {
  it("blocks submission when all data is missing", () => {
    const emptySource = {
      record: {
        clientId: "",
        costCenterId: "",
        droneId: "",
        operatorId: "",
        geometryJson: null,
        operationDate: new Date(),
      },
      documents: [],
      drone: null,
      operator: null,
      weatherReady: false,
    };

    const review = evaluateChecklistSubmission(emptySource, {});
    expect(review.canSubmit).toBe(false);
    expect(review.missingItemIds.length).toBeGreaterThan(0);
  });

  it("missing items include both automated and manual failures", () => {
    const review = evaluateChecklistSubmission(validSource, {});
    // Manual checks population-check and restriction-check are missing
    expect(review.missingItemIds).toContain("population-check");
    expect(review.missingItemIds).toContain("restriction-check");
  });

  it("persisted manual override can fulfill manual checks", () => {
    const review = evaluateChecklistSubmission(validSource, {
      "population-check": true,
      "restriction-check": true,
    });
    expect(review.canSubmit).toBe(true);
  });

  it("persisted override cannot skip automated checks", () => {
    const source = {
      ...validSource,
      drone: { insuranceExpiry: new Date("2020-01-01") },
    };
    const review = evaluateChecklistSubmission(source as typeof validSource, {
      "drone-registered": true,
      "population-check": true,
      "restriction-check": true,
    });
    // drone-registered is automated — override is ignored if source data fails
    expect(review.canSubmit).toBe(false);
    expect(review.missingItemIds).toContain("drone-registered");
  });
});

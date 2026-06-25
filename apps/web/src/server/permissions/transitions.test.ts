import { describe, expect, it } from "vitest";
import {
  getAllowedTransitions,
  getStatusLabel,
  getStatusTone,
  isTerminalState,
  isValidTransition,
  STATUS_LABELS,
  TERMINAL_STATES,
  VALID_TRANSITIONS,
  validateTransition,
} from "./transitions";

// ─── DATA INTEGRITY ──────────────────────────────────────

describe("State machine data integrity", () => {
  it("has exactly 10 states defined", () => {
    const states = Object.keys(VALID_TRANSITIONS);
    expect(states).toHaveLength(10);
    expect(states.sort()).toEqual([
      "AUTHORIZED",
      "CANCELLED",
      "CLOSED",
      "DRAFT",
      "EXPIRED",
      "IN_REVIEW",
      "OBSERVED",
      "READY_FOR_SUBMISSION",
      "REJECTED",
      "SUBMITTED",
    ]);
  });

  it("all VALID_TRANSITIONS values point to existing states", () => {
    const allStates = new Set(Object.keys(VALID_TRANSITIONS));
    for (const [from, allowed] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of allowed) {
        expect(
          allStates.has(to),
          `Transition ${from} → ${to}: target "${to}" is not a defined state`,
        ).toBe(true);
      }
    }
  });

  it("no transition points to its own state (no-op)", () => {
    for (const [from, allowed] of Object.entries(VALID_TRANSITIONS)) {
      expect(
        allowed.includes(from as any),
        `State "${from}" should not list itself as a valid transition`,
      ).toBe(false);
    }
  });

  it("has all 10 states in STATUS_LABELS", () => {
    const allStates = Object.keys(VALID_TRANSITIONS);
    for (const state of allStates) {
      expect(STATUS_LABELS, `State "${state}" is missing a Spanish label`).toHaveProperty(state);
    }
  });

  it("has exactly 2 terminal states", () => {
    expect(TERMINAL_STATES.size).toBe(2);
    expect(TERMINAL_STATES.has("CLOSED")).toBe(true);
    expect(TERMINAL_STATES.has("CANCELLED")).toBe(true);
  });
});

// ─── TRANSITION TABLE (15 transitions) ────────────────────

describe("Transition table (15 transitions)", () => {
  const table: Array<{ from: string; to: string; allowed: boolean }> = [
    // DRAFT (1 transition)
    { from: "DRAFT", to: "IN_REVIEW", allowed: true },
    { from: "DRAFT", to: "SUBMITTED", allowed: false },
    { from: "DRAFT", to: "AUTHORIZED", allowed: false },
    { from: "DRAFT", to: "CLOSED", allowed: false },

    // IN_REVIEW (2 transitions)
    { from: "IN_REVIEW", to: "DRAFT", allowed: true },
    { from: "IN_REVIEW", to: "READY_FOR_SUBMISSION", allowed: true },
    { from: "IN_REVIEW", to: "SUBMITTED", allowed: false },

    // READY_FOR_SUBMISSION (1 transition)
    { from: "READY_FOR_SUBMISSION", to: "SUBMITTED", allowed: true },
    { from: "READY_FOR_SUBMISSION", to: "DRAFT", allowed: false },

    // SUBMITTED (3 transitions)
    { from: "SUBMITTED", to: "AUTHORIZED", allowed: true },
    { from: "SUBMITTED", to: "OBSERVED", allowed: true },
    { from: "SUBMITTED", to: "REJECTED", allowed: true },
    { from: "SUBMITTED", to: "DRAFT", allowed: false },

    // OBSERVED (2 transitions)
    { from: "OBSERVED", to: "IN_REVIEW", allowed: true },
    { from: "OBSERVED", to: "EXPIRED", allowed: true },
    { from: "OBSERVED", to: "DRAFT", allowed: false },

    // AUTHORIZED (2 transitions)
    { from: "AUTHORIZED", to: "EXPIRED", allowed: true },
    { from: "AUTHORIZED", to: "CLOSED", allowed: true },
    { from: "AUTHORIZED", to: "DRAFT", allowed: false },

    // REJECTED (2 transitions)
    { from: "REJECTED", to: "DRAFT", allowed: true },
    { from: "REJECTED", to: "CANCELLED", allowed: true },
    { from: "REJECTED", to: "IN_REVIEW", allowed: false },

    // EXPIRED (2 transitions)
    { from: "EXPIRED", to: "DRAFT", allowed: true },
    { from: "EXPIRED", to: "CANCELLED", allowed: true },
    { from: "EXPIRED", to: "CLOSED", allowed: false },

    // CLOSED (0 transitions — terminal, no arrows)
    { from: "CLOSED", to: "DRAFT", allowed: false },
    { from: "CLOSED", to: "CANCELLED", allowed: false },

    // CANCELLED (0 transitions — terminal)
    { from: "CANCELLED", to: "DRAFT", allowed: false },
    { from: "CANCELLED", to: "CLOSED", allowed: false },
  ];

  it.each(table)("$from → $to is $allowed", ({ from, to, allowed }) => {
    expect(isValidTransition(from, to)).toBe(allowed);
  });

  it("counts exactly 15 allowed transitions in the test table", () => {
    const allowedCount = table.filter((t) => t.allowed).length;
    expect(allowedCount).toBe(15);
  });

  it("matches the total allowed transitions defined", () => {
    const totalAllowed = Object.values(VALID_TRANSITIONS).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalAllowed).toBe(15);
  });
});

// ─── isValidTransition ────────────────────────────────────

describe("isValidTransition", () => {
  it("returns false for unknown source state", () => {
    expect(isValidTransition("UNKNOWN", "DRAFT")).toBe(false);
  });

  it("returns false for unknown target state", () => {
    expect(isValidTransition("DRAFT", "UNKNOWN")).toBe(false);
  });

  it("handles case sensitivity", () => {
    expect(isValidTransition("draft", "in_review")).toBe(false);
    expect(isValidTransition("Draft", "In_Review")).toBe(false);
  });
});

// ─── isTerminalState ──────────────────────────────────────

describe("isTerminalState", () => {
  it("CLOSED is terminal", () => {
    expect(isTerminalState("CLOSED")).toBe(true);
  });

  it("CANCELLED is terminal", () => {
    expect(isTerminalState("CANCELLED")).toBe(true);
  });

  it("DRAFT is not terminal", () => {
    expect(isTerminalState("DRAFT")).toBe(false);
  });

  it("AUTHORIZED is not terminal", () => {
    expect(isTerminalState("AUTHORIZED")).toBe(false);
  });

  it("returns false for unknown state", () => {
    expect(isTerminalState("UNKNOWN")).toBe(false);
  });
});

// ─── getAllowedTransitions ────────────────────────────────

describe("getAllowedTransitions", () => {
  it("DRAFT allows only IN_REVIEW", () => {
    expect(getAllowedTransitions("DRAFT")).toEqual(["IN_REVIEW"]);
  });

  it("CLOSED allows nothing", () => {
    expect(getAllowedTransitions("CLOSED")).toEqual([]);
  });

  it("CANCELLED allows nothing", () => {
    expect(getAllowedTransitions("CANCELLED")).toEqual([]);
  });

  it("SUBMITTED allows 3 transitions", () => {
    const allowed = getAllowedTransitions("SUBMITTED");
    expect(allowed).toHaveLength(3);
    expect(allowed).toContain("AUTHORIZED");
    expect(allowed).toContain("OBSERVED");
    expect(allowed).toContain("REJECTED");
  });

  it("returns empty array for unknown state", () => {
    expect(getAllowedTransitions("UNKNOWN")).toEqual([]);
  });
});

// ─── validateTransition ───────────────────────────────────

describe("validateTransition", () => {
  it("returns null for a valid transition", () => {
    expect(validateTransition("DRAFT", "IN_REVIEW")).toBeNull();
    expect(validateTransition("SUBMITTED", "AUTHORIZED")).toBeNull();
    expect(validateTransition("REJECTED", "DRAFT")).toBeNull();
  });

  it("rejects self-transition (same state)", () => {
    expect(validateTransition("DRAFT", "DRAFT")).toBe("Flight plan is already in DRAFT status.");
  });

  it("rejects transition from terminal state CLOSED", () => {
    const error = validateTransition("CLOSED", "DRAFT");
    expect(error).toContain("Cannot transition from terminal state");
    expect(error).toContain("CLOSED");
  });

  it("rejects transition from terminal state CANCELLED", () => {
    const error = validateTransition("CANCELLED", "DRAFT");
    expect(error).toContain("Cannot transition from terminal state");
    expect(error).toContain("CANCELLED");
  });

  it("rejects invalid transition with allowed list", () => {
    const error = validateTransition("DRAFT", "AUTHORIZED");
    expect(error).toContain("Invalid transition from DRAFT to AUTHORIZED");
    expect(error).toContain("Allowed:");
    expect(error).toContain("IN_REVIEW");
  });

  it("rejects transition from terminal state with empty allowed", () => {
    const error = validateTransition("CLOSED", "AUTHORIZED");
    expect(error).toContain("terminal state");
  });

  it("validates multiple transition paths work", () => {
    // DRAFT → IN_REVIEW → READY_FOR_SUBMISSION → SUBMITTED → AUTHORIZED
    expect(validateTransition("DRAFT", "IN_REVIEW")).toBeNull();
    expect(validateTransition("IN_REVIEW", "READY_FOR_SUBMISSION")).toBeNull();
    expect(validateTransition("READY_FOR_SUBMISSION", "SUBMITTED")).toBeNull();
    expect(validateTransition("SUBMITTED", "AUTHORIZED")).toBeNull();

    // Rejected path: DRAFT → REJECTED → DRAFT
    expect(validateTransition("DRAFT", "REJECTED")).not.toBeNull();
    expect(validateTransition("IN_REVIEW", "SUBMITTED")).not.toBeNull();
  });
});

// ─── getStatusLabel / getStatusTone ───────────────────────

describe("getStatusLabel", () => {
  it("returns Spanish labels", () => {
    expect(getStatusLabel("DRAFT")).toBe("Borrador");
    expect(getStatusLabel("AUTHORIZED")).toBe("Autorizado");
    expect(getStatusLabel("OBSERVED")).toBe("Observado");
    expect(getStatusLabel("CANCELLED")).toBe("Cancelado");
  });

  it("falls back to raw status for unknown value", () => {
    expect(getStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("getStatusTone", () => {
  it("AUTHORIZED returns success", () => {
    expect(getStatusTone("AUTHORIZED")).toBe("success");
  });

  it("REJECTED returns danger", () => {
    expect(getStatusTone("REJECTED")).toBe("danger");
  });

  it("DRAFT returns neutral", () => {
    expect(getStatusTone("DRAFT")).toBe("neutral");
  });

  it("IN_REVIEW returns info", () => {
    expect(getStatusTone("IN_REVIEW")).toBe("info");
  });

  it("falls back to neutral for unknown status", () => {
    expect(getStatusTone("UNKNOWN")).toBe("neutral");
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { canEditEntity, isReviewer } from "@/lib/authorize";

describe("authorization helpers", () => {
  it("treats operational roles as editors", () => {
    expect(canEditEntity("ADMIN")).toBe(true);
    expect(canEditEntity("GERENTE_OPERACIONES_AEREAS")).toBe(true);
    expect(canEditEntity("OPERADOR_RPA")).toBe(true);
  });

  it("treats review-only roles as non-editors", () => {
    expect(canEditEntity("AUDITOR")).toBe(false);
    expect(canEditEntity("VIEWER")).toBe(false);
    expect(canEditEntity("JEFE_SEGURIDAD_AEREA")).toBe(false);
  });

  it("detects reviewer-style roles", () => {
    expect(isReviewer("REVIEWER")).toBe(true);
    expect(isReviewer("VIEWER")).toBe(true);
    expect(isReviewer("AUDITOR")).toBe(true);
    expect(isReviewer("OPERADOR_RPA")).toBe(false);
  });
});

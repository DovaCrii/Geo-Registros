import { describe, expect, it } from "vitest";

import { getTransitionLoadingMessage, getTransitionSuccessMessage } from "./permission-actions.utils";

describe("permission actions microinteractions", () => {
  it("formats a success message with previous and next status", () => {
    expect(getTransitionSuccessMessage("AUTHORIZED", "SUBMITTED")).toBe(
      "Permiso autorizar. SUBMITTED → AUTHORIZED",
    );
  });

  it("formats a loading message for the next status", () => {
    expect(getTransitionLoadingMessage("SUBMITTED")).toBe("Actualizando a enviar...");
  });
});

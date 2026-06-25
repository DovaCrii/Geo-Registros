import { describe, expect, it } from "vitest";
import { summarize } from "./queries";

describe("summarize", () => {
  it("returns zero counts for empty array", () => {
    const result = summarize([]);
    expect(result).toEqual({ total: 0, active: 0, inactive: 0 });
  });

  it("counts all items as active when all are ACTIVE", () => {
    const items = [{ status: "ACTIVE" }, { status: "ACTIVE" }, { status: "ACTIVE" }];
    const result = summarize(items);
    expect(result).toEqual({ total: 3, active: 3, inactive: 0 });
  });

  it("counts all items as inactive when all are INACTIVE", () => {
    const items = [{ status: "INACTIVE" }, { status: "INACTIVE" }];
    const result = summarize(items);
    expect(result).toEqual({ total: 2, active: 0, inactive: 2 });
  });

  it("correctly splits mixed statuses", () => {
    const items = [
      { status: "ACTIVE" },
      { status: "INACTIVE" },
      { status: "ACTIVE" },
      { status: "INACTIVE" },
      { status: "ACTIVE" },
    ];
    const result = summarize(items);
    expect(result).toEqual({ total: 5, active: 3, inactive: 2 });
  });

  it("ignores unknown statuses (not ACTIVE/INACTIVE)", () => {
    const items = [{ status: "ACTIVE" }, { status: "PENDING" }, { status: "INACTIVE" }];
    const result = summarize(items);
    expect(result).toEqual({ total: 3, active: 1, inactive: 1 });
  });

  it("works with single item", () => {
    expect(summarize([{ status: "ACTIVE" }])).toEqual({ total: 1, active: 1, inactive: 0 });
    expect(summarize([{ status: "INACTIVE" }])).toEqual({ total: 1, active: 0, inactive: 1 });
  });
});

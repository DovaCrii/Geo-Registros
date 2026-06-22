import { describe, expect, it } from "vitest";

import { groupFlightPlansByOperationDate } from "@/lib/operational-calendar";

describe("groupFlightPlansByOperationDate", () => {
  const now = new Date("2026-06-22T12:00:00.000Z");

  it("groups plans by day and keeps sorted order", () => {
    const grouped = groupFlightPlansByOperationDate(
      [
        { id: "3", code: "FP-003", title: "Evening", operationDate: "2026-06-23T18:00:00.000Z" },
        { id: "1", code: "FP-001", title: "Morning", operationDate: "2026-06-22T08:00:00.000Z" },
        { id: "2", code: "FP-002", title: "Afternoon", operationDate: "2026-06-22T14:00:00.000Z" },
      ],
      now,
    );

    expect(grouped).toHaveLength(2);
    expect(grouped[0].label).toBe("Hoy");
    expect(grouped[0].items.map((item) => item.code)).toEqual(["FP-001", "FP-002"]);
    expect(grouped[1].label).toBe("Mañana");
    expect(grouped[1].items[0].code).toBe("FP-003");
  });

  it("skips invalid or missing dates", () => {
    const grouped = groupFlightPlansByOperationDate(
      [
        { id: "1", code: "FP-001", title: "Valid", operationDate: "2026-06-22T08:00:00.000Z" },
        { id: "2", code: "FP-002", title: "Missing", operationDate: null },
        { id: "3", code: "FP-003", title: "Invalid", operationDate: "not-a-date" },
      ],
      now,
    );

    expect(grouped).toHaveLength(1);
    expect(grouped[0].items).toHaveLength(1);
    expect(grouped[0].items[0].code).toBe("FP-001");
  });
});

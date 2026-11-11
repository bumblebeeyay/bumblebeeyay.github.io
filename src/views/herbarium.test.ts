import { describe, expect, it } from "vitest";
import { herbariumDate, specimenNumber } from "./herbarium";

describe("herbarium labels", () => {
  it("pads specimen numbers", () => {
    expect(specimenNumber(3)).toBe("No. 03");
    expect(specimenNumber(12)).toBe("No. 12");
  });

  it("writes the month in roman numerals", () => {
    expect(herbariumDate(new Date(2026, 10, 11))).toBe("11 · XI · 2026");
  });
});

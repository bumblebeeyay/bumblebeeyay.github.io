import { describe, expect, it } from "vitest";
import { isNightAt } from "./media";

const at = (hour: number) => new Date(2026, 10, 11, hour, 30);

describe("isNightAt", () => {
  it("is day in the afternoon and evening", () => {
    expect(isNightAt(at(14))).toBe(false);
    expect(isNightAt(at(20))).toBe(false);
  });

  it("is night from 21:00 to dawn", () => {
    expect(isNightAt(at(21))).toBe(true);
    expect(isNightAt(at(2))).toBe(true);
    expect(isNightAt(at(6))).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { isNightAt } from "./time";

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

  it("switches exactly at 21:00 and 6:00", () => {
    expect(isNightAt(new Date(2026, 10, 11, 20, 59))).toBe(false);
    expect(isNightAt(new Date(2026, 10, 11, 21, 0))).toBe(true);
    expect(isNightAt(new Date(2026, 10, 11, 5, 59))).toBe(true);
    expect(isNightAt(new Date(2026, 10, 11, 6, 0))).toBe(false);
  });

  it("is night at midnight", () => {
    expect(isNightAt(new Date(2026, 10, 11, 0, 0))).toBe(true);
  });
});

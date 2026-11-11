import { describe, expect, it } from "vitest";
import { hashString, seededRandom } from "./random";

describe("seededRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("stays within [0, 1)", () => {
    const next = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const value = next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("hashString", () => {
  it("is stable and tells strings apart", () => {
    expect(hashString("daisy")).toBe(hashString("daisy"));
    expect(hashString("daisy")).not.toBe(hashString("tulip"));
  });
});

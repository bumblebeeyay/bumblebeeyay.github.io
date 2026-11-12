import { describe, expect, it } from "vitest";
import { grassBladesPath } from "./scenery";

describe("grassBladesPath", () => {
  it("starts and ends at the base, so tiles join without a seam", () => {
    const path = grassBladesPath(1, { tall: 80, base: 120 });
    expect(path.startsWith("M0 200V120")).toBe(true);
    expect(path.endsWith("1440.0 120V200Z")).toBe(true);
  });

  it("is the same for the same seed", () => {
    expect(grassBladesPath(5, { tall: 60, base: 150 })).toBe(
      grassBladesPath(5, { tall: 60, base: 150 }),
    );
  });
});

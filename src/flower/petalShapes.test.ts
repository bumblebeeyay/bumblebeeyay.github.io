import { describe, expect, it } from "vitest";
import { petalAngles } from "./petalShapes";

describe("petalAngles", () => {
  it("spreads ring petals evenly around the circle", () => {
    expect(petalAngles({ count: 4, arc: { kind: "ring" } })).toEqual([
      0, 90, 180, 270,
    ]);
  });

  it("spreads fan petals from edge to edge", () => {
    expect(
      petalAngles({ count: 3, arc: { kind: "fan", from: -30, to: 30 } }),
    ).toEqual([-30, 0, 30]);
  });

  it("centers a single fan petal", () => {
    expect(
      petalAngles({ count: 1, arc: { kind: "fan", from: -30, to: 30 } }),
    ).toEqual([0]);
  });

  it("returns nothing for zero petals", () => {
    expect(petalAngles({ count: 0, arc: { kind: "ring" } })).toEqual([]);
  });
});

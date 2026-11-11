import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { vec2, type Vec2 } from "../util/vec2";
import { Bee } from "./Bee";
import type { BeeBehaviour } from "./behaviours";

const FRAME_MS = 1000 / 60;

/** Stays put at `target`, at the given speed. */
const hover = (target: Vec2, speed = 0.5, bobs = false): BeeBehaviour => ({
  speed,
  bobs,
  targetAt: () => target,
});

/** Reads the bee's position back from its transform (the element is 0×0 in tests). */
function positionOf(element: HTMLElement): Vec2 {
  const match = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(
    element.style.transform,
  );
  return vec2(Number(match?.[1]), Number(match?.[2]));
}

describe("Bee", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.append(element);
  });

  afterEach(() => {
    element.remove();
    vi.useRealTimers();
  });

  it("eases toward its behaviour's target", () => {
    const bee = new Bee(element, vec2(0, 0), hover(vec2(100, 0)));
    bee.update(FRAME_MS, 0);
    expect(positionOf(element).x).toBeCloseTo(50);
    bee.update(FRAME_MS, FRAME_MS);
    expect(positionOf(element).x).toBeCloseTo(75);
  });

  it("faces the way it flies", () => {
    const bee = new Bee(element, vec2(100, 0), hover(vec2(0, 0)));
    bee.update(FRAME_MS, 0);
    expect(element.style.transform).toContain("scaleX(-1)");
  });

  it("bobs only when its behaviour says so", () => {
    // A quarter of the bob period, where the sine is at its peak.
    const quarter = 1760 / 4;
    const still = new Bee(element, vec2(0, 0), hover(vec2(0, 0), 0.5, false));
    still.update(FRAME_MS, quarter);
    expect(positionOf(element).y).toBeCloseTo(0);

    const bobbing = new Bee(element, vec2(0, 0), hover(vec2(0, 0), 0.5, true));
    bobbing.update(FRAME_MS, quarter);
    expect(positionOf(element).y).toBeCloseTo(4);
  });

  it("resolves flyTo once it arrives", async () => {
    const bee = new Bee(element, vec2(0, 0), hover(vec2(0, 0)));
    let arrived = false;
    const flight = bee.flyTo(vec2(200, 0)).then(() => (arrived = true));

    bee.update(FRAME_MS, 0);
    await Promise.resolve();
    expect(arrived).toBe(false);

    for (let i = 0; i < 120; i++) bee.update(FRAME_MS, i * FRAME_MS);
    await flight;
    expect(arrived).toBe(true);
  });

  it("resolves flyTo after the timeout even if it never arrives", async () => {
    vi.useFakeTimers();
    const bee = new Bee(element, vec2(0, 0), hover(vec2(0, 0)));
    const flight = bee.flyTo(vec2(1000, 0), 300);
    vi.advanceTimersByTime(300);
    await expect(flight).resolves.toBeUndefined();
  });

  it("settles a pending flight when the behaviour changes", async () => {
    const bee = new Bee(element, vec2(0, 0), hover(vec2(0, 0)));
    const flight = bee.flyTo(vec2(1000, 0));
    bee.setBehaviour(hover(vec2(0, 0)));
    await expect(flight).resolves.toBeUndefined();
  });
});

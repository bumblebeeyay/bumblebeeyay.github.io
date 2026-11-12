import { describe, expect, it } from "vitest";
import { vec2, type Vec2 } from "../util/vec2";
import type { PointerSource } from "../input/PointerTracker";
import {
  Circling,
  FlyTo,
  FollowPointer,
  type BeeBehaviour,
} from "./behaviours";

const options = {
  speed: 0.05,
  radius: vec2(10, 20),
  periodMs: 1000,
  fallbackCenter: vec2(500, 500),
};

describe("FlyTo", () => {
  it("always targets its destination, fast and without bobbing", () => {
    const fly = new FlyTo(vec2(3, 4));
    expect(fly.targetAt()).toEqual(vec2(3, 4));
    expect(fly.bobs).toBe(false);
    expect(fly.speed).toBeGreaterThan(0.1);
  });
});

describe("Circling", () => {
  it("loops around its center", () => {
    const circling = new Circling(() => vec2(100, 100), options);
    // At t = 0: cos 0 = 1 on x, sin 0 = 0 on y.
    expect(circling.targetAt(0)).toEqual(vec2(110, 100));
    // A full period later on x, the loop is back where it started.
    expect(circling.targetAt(1000).x).toBeCloseTo(110);
  });

  it("stays within its radius", () => {
    const circling = new Circling(() => vec2(0, 0), options);
    for (let t = 0; t < 2000; t += 37) {
      const { x, y } = circling.targetAt(t);
      expect(Math.abs(x)).toBeLessThanOrEqual(10 + 1e-9);
      expect(Math.abs(y)).toBeLessThanOrEqual(20 + 1e-9);
    }
  });

  it("follows a moving center", () => {
    let center = vec2(0, 0);
    const circling = new Circling(() => center, options);
    center = vec2(300, 0);
    expect(circling.targetAt(0)).toEqual(vec2(310, 0));
  });

  it("uses the fallback until the center is known", () => {
    const circling = new Circling(() => null, options);
    expect(circling.targetAt(0)).toEqual(vec2(510, 500));
  });

  it("keeps the last known center when it disappears", () => {
    let center: Vec2 | null = vec2(50, 50);
    const circling = new Circling(() => center, options);
    circling.targetAt(0);
    center = null;
    expect(circling.targetAt(0)).toEqual(vec2(60, 50));
  });
});

describe("FollowPointer", () => {
  const fallback: BeeBehaviour = {
    speed: 0,
    bobs: true,
    targetAt: () => vec2(-1, -1),
  };

  it("stays a little up-left of the pointer", () => {
    const pointer: PointerSource = { position: vec2(100, 100) };
    const follow = new FollowPointer(pointer, fallback, vec2(-10, -20));
    expect(follow.targetAt(0)).toEqual(vec2(90, 80));
  });

  it("falls back while the pointer has not moved", () => {
    const follow = new FollowPointer({ position: null }, fallback);
    expect(follow.targetAt(0)).toEqual(vec2(-1, -1));
  });
});

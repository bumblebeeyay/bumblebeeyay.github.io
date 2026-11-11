import { describe, expect, it } from "vitest";
import { vec2 } from "../util/vec2";
import { PointerTracker } from "./PointerTracker";

describe("PointerTracker", () => {
  it("knows nothing until the pointer moves", () => {
    expect(new PointerTracker(window).position).toBeNull();
  });

  it("follows moves, and touches that start without a move", () => {
    const tracker = new PointerTracker(window);
    tracker.start();
    window.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
    );
    expect(tracker.position).toEqual(vec2(10, 20));
    window.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 30, clientY: 40 }),
    );
    expect(tracker.position).toEqual(vec2(30, 40));
  });

  it("stops following once destroyed", () => {
    const tracker = new PointerTracker(window);
    tracker.start();
    tracker.destroy();
    window.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 10, clientY: 20 }),
    );
    expect(tracker.position).toBeNull();
  });
});

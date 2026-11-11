import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h } from "../dom/create";
import { GreenhouseFog } from "./GreenhouseFog";

/** Gives `element` a fixed box on screen (happy-dom does no layout). */
function placeAt(element: Element, left: number, top: number, size = 10) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
    new DOMRect(left, top, size, size),
  );
}

function setUp() {
  const left = h("span", { class: "greenhouse__pane" });
  const right = h("span", { class: "greenhouse__pane" });
  const plot = h("button", { type: "button" });
  const greenhouse = h("div", { class: "greenhouse" }, plot, left, right);
  placeAt(left, 0, 0);
  placeAt(right, 20, 0);
  new GreenhouseFog(greenhouse).start();
  return { greenhouse, left, right, plot };
}

const isWiped = (pane: Element) => pane.classList.contains("is-wiped");

let frames: FrameRequestCallback[] = [];
/** Runs the animation frames requested so far. */
const nextFrame = () => {
  const pending = frames;
  frames = [];
  for (const frame of pending) frame(0);
};

describe("GreenhouseFog", () => {
  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) =>
      frames.push(frame),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it("handles a burst of pointer moves once per frame, at the latest position", () => {
    const { greenhouse, left, right } = setUp();
    for (const clientX of [5, 15, 25]) {
      greenhouse.dispatchEvent(
        new PointerEvent("pointermove", { clientX, clientY: 5 }),
      );
    }
    expect(frames).toHaveLength(1);
    expect(isWiped(right)).toBe(false);
    nextFrame();
    expect(isWiped(right)).toBe(true);
    expect(isWiped(left)).toBe(false);
  });

  it("stops measuring panes once they are wiped", () => {
    const { greenhouse, left } = setUp();
    greenhouse.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 5, clientY: 5 }),
    );
    nextFrame();
    const measure = vi.mocked(left.getBoundingClientRect);
    measure.mockClear();
    greenhouse.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 25, clientY: 5 }),
    );
    nextFrame();
    expect(measure).not.toHaveBeenCalled();
  });

  it("wipes the pane under the pointer, and only that one", () => {
    const { greenhouse, left, right } = setUp();
    greenhouse.dispatchEvent(
      new PointerEvent("pointermove", { clientX: 25, clientY: 5 }),
    );
    nextFrame();
    expect(isWiped(right)).toBe(true);
    expect(isWiped(left)).toBe(false);
  });

  it("also wipes on touch, which starts with pointerdown", () => {
    const { greenhouse, left } = setUp();
    greenhouse.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: 5, clientY: 5 }),
    );
    nextFrame();
    expect(isWiped(left)).toBe(true);
  });

  it("clears the panes in front of a plot that gets keyboard focus", () => {
    const { left, right, plot } = setUp();
    placeAt(plot, 2, 2, 4);
    plot.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(isWiped(left)).toBe(true);
    expect(isWiped(right)).toBe(false);
  });
});

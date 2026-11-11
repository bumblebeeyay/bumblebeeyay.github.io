import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { h } from "../dom/create";
import { WorldScroller } from "./WorldScroller";

describe("WorldScroller", () => {
  let viewport: HTMLElement;
  let scene: HTMLElement;
  let scroller: WorldScroller;
  let scrollTo: ReturnType<typeof vi.fn<(options: ScrollToOptions) => void>>;

  beforeEach(() => {
    viewport = h("main", {}, h("button", { type: "button" }));
    scene = h("div", {}, viewport);
    document.body.replaceChildren(scene);
    Object.defineProperty(viewport, "clientWidth", { value: 1000 });
    // happy-dom does not scroll; record the requests and apply them by hand.
    scrollTo = vi.fn((options: ScrollToOptions) => {
      viewport.scrollLeft = options.left ?? viewport.scrollLeft;
    });
    viewport.scrollTo = scrollTo as unknown as typeof viewport.scrollTo;
    scroller = new WorldScroller(viewport, scene, false);
    scroller.start();
  });

  afterEach(() => {
    // Listeners on window outlive each test's scroller: disable it so it stays quiet.
    scroller.enabled = false;
  });

  const key = (k: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", {
      key: k,
      cancelable: true,
      ...init,
    });
    window.dispatchEvent(event);
    return event;
  };

  it("publishes the scroll position for the parallax, and to listeners", () => {
    const listener = vi.fn();
    scroller.onScroll(listener);
    expect(scene.style.getPropertyValue("--scroll-x")).toBe("0");
    expect(listener).toHaveBeenCalledWith(0);
  });

  it("turns a vertical wheel into sideways scrolling", () => {
    const wheel = new WheelEvent("wheel", { deltaY: 120, cancelable: true });
    viewport.dispatchEvent(wheel);
    expect(viewport.scrollLeft).toBe(120);
    expect(wheel.defaultPrevented).toBe(true);
  });

  it("converts line-based wheels to pixels", () => {
    viewport.dispatchEvent(
      new WheelEvent("wheel", {
        deltaY: 3,
        deltaMode: WheelEvent.DOM_DELTA_LINE,
      }),
    );
    expect(viewport.scrollLeft).toBe(120);
  });

  it("leaves horizontal wheels, zooming and a disabled world alone", () => {
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaX: 50, deltaY: 10 }));
    // happy-dom's WheelEvent ignores `ctrlKey` in its init, so set it by hand.
    const zoom = new WheelEvent("wheel", { deltaY: 100 });
    Object.defineProperty(zoom, "ctrlKey", { value: true });
    viewport.dispatchEvent(zoom);
    scroller.enabled = false;
    viewport.dispatchEvent(new WheelEvent("wheel", { deltaY: 100 }));
    expect(viewport.scrollLeft).toBe(0);
  });

  it("walks with the arrow keys, Page Up/Down, Home and End", () => {
    expect(key("ArrowRight").defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: 350,
      behavior: "smooth",
    });
    key("PageDown");
    expect(viewport.scrollLeft).toBe(350 + 850);
    key("Home");
    expect(viewport.scrollLeft).toBe(0);
    key("End");
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: viewport.scrollWidth,
      behavior: "smooth",
    });
  });

  it("ignores other keys, shortcuts, and keys while disabled", () => {
    expect(key("a").defaultPrevented).toBe(false);
    expect(key("ArrowRight", { ctrlKey: true }).defaultPrevented).toBe(false);
    scroller.enabled = false;
    expect(key("ArrowRight").defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("moves instantly when the visitor prefers reduced motion", () => {
    const calm = new WorldScroller(viewport, scene, true);
    calm.scrollTo(200);
    expect(scrollTo).toHaveBeenLastCalledWith({
      left: 200,
      behavior: "instant",
    });
  });

  describe("dragging with the mouse", () => {
    const pointer = (type: string, clientX: number, target: EventTarget) =>
      target.dispatchEvent(
        new PointerEvent(type, {
          clientX,
          pointerType: "mouse",
          button: 0,
          bubbles: true,
        }),
      );

    it("drags the world along, then swallows the click that ends the drag", () => {
      const button = viewport.querySelector("button");
      const onClick = vi.fn();
      button?.addEventListener("click", onClick);

      pointer("pointerdown", 500, viewport);
      pointer("pointermove", 400, window);
      expect(viewport.scrollLeft).toBe(100);
      expect(viewport.classList.contains("is-dragging")).toBe(true);
      pointer("pointerup", 400, window);
      expect(viewport.classList.contains("is-dragging")).toBe(false);

      button?.click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("stops dragging when the pointer is cancelled, which sends no pointerup", () => {
      pointer("pointerdown", 500, viewport);
      pointer("pointermove", 400, window);
      pointer("pointercancel", 400, window);
      pointer("pointermove", 100, window);
      expect(viewport.scrollLeft).toBe(100);
      expect(viewport.classList.contains("is-dragging")).toBe(false);
    });

    it("captures the pointer once a real drag starts, not before", () => {
      const capture = vi.spyOn(viewport, "setPointerCapture");
      pointer("pointerdown", 500, viewport);
      pointer("pointermove", 498, window);
      expect(capture).not.toHaveBeenCalled();
      pointer("pointermove", 400, window);
      expect(capture).toHaveBeenCalledOnce();
      pointer("pointerup", 400, window);
    });

    it("treats a tiny movement as a plain click", () => {
      const button = viewport.querySelector("button");
      const onClick = vi.fn();
      button?.addEventListener("click", onClick);

      pointer("pointerdown", 500, viewport);
      pointer("pointermove", 497, window);
      pointer("pointerup", 497, window);
      button?.click();

      expect(viewport.scrollLeft).toBe(0);
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});

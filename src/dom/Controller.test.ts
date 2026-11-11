import { describe, expect, it, vi } from "vitest";
import { Controller } from "./Controller";

/** Counts clicks on `target` while started. */
class ClickCounter extends Controller {
  clicks = 0;
  readonly connected = vi.fn();

  constructor(private readonly target: EventTarget) {
    super();
  }

  protected connect(signal: AbortSignal): void {
    this.connected();
    this.target.addEventListener("click", () => this.clicks++, { signal });
  }
}

const click = (target: EventTarget) => target.dispatchEvent(new Event("click"));

describe("Controller", () => {
  it("does nothing until started", () => {
    const target = new EventTarget();
    const counter = new ClickCounter(target);
    click(target);
    expect(counter.clicks).toBe(0);
    expect(counter.isStarted).toBe(false);
  });

  it("wires up once, however many times it is started", () => {
    const target = new EventTarget();
    const counter = new ClickCounter(target);
    counter.start();
    counter.start();
    click(target);
    expect(counter.connected).toHaveBeenCalledOnce();
    expect(counter.clicks).toBe(1);
  });

  it("unwires everything on destroy, and can start again", () => {
    const target = new EventTarget();
    const counter = new ClickCounter(target);
    counter.start();
    counter.destroy();
    click(target);
    expect(counter.clicks).toBe(0);
    expect(counter.isStarted).toBe(false);

    counter.start();
    click(target);
    expect(counter.clicks).toBe(1);
  });

  it("can be destroyed before it ever started", () => {
    expect(() => new ClickCounter(new EventTarget()).destroy()).not.toThrow();
  });
});

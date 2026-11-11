import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startLoop } from "./loop";

describe("startLoop", () => {
  let callbacks: FrameRequestCallback[];

  /** Runs the pending animation frame at `time`. */
  const frameAt = (time: number): void => {
    const pending = callbacks;
    callbacks = [];
    for (const callback of pending) callback(time);
  };

  beforeEach(() => {
    callbacks = [];
    vi.spyOn(performance, "now").mockReturnValue(0);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => (callbacks = []));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("passes the frame duration and the time", () => {
    const onFrame = vi.fn();
    startLoop(onFrame);
    frameAt(16);
    frameAt(32);
    expect(onFrame.mock.calls).toEqual([
      [16, 16],
      [16, 32],
    ]);
  });

  it("caps long frames, so a hidden tab does not teleport the bee", () => {
    const onFrame = vi.fn();
    startLoop(onFrame);
    frameAt(5000);
    expect(onFrame).toHaveBeenCalledWith(50, 5000);
  });

  it("stops when asked", () => {
    const onFrame = vi.fn();
    const stop = startLoop(onFrame);
    frameAt(16);
    stop();
    frameAt(32);
    expect(onFrame).toHaveBeenCalledTimes(1);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnimationLoop } from "./loop";

describe("AnimationLoop", () => {
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

  const started = (onFrame: () => void) => {
    const loop = new AnimationLoop(onFrame);
    loop.start();
    return loop;
  };

  it("does nothing until started", () => {
    new AnimationLoop(vi.fn());
    expect(callbacks).toHaveLength(0);
  });

  it("passes the frame duration and the time", () => {
    const onFrame = vi.fn();
    started(onFrame);
    frameAt(16);
    frameAt(32);
    expect(onFrame.mock.calls).toEqual([
      [16, 16],
      [16, 32],
    ]);
  });

  it("caps long frames, so a hidden tab does not teleport the bee", () => {
    const onFrame = vi.fn();
    started(onFrame);
    frameAt(5000);
    expect(onFrame).toHaveBeenCalledWith(50, 5000);
  });

  it("never passes a negative duration", () => {
    const onFrame = vi.fn();
    vi.mocked(performance.now).mockReturnValue(100);
    started(onFrame);
    frameAt(90);
    expect(onFrame).toHaveBeenCalledWith(0, 90);
  });

  it("stops when destroyed", () => {
    const onFrame = vi.fn();
    const loop = started(onFrame);
    frameAt(16);
    loop.destroy();
    frameAt(32);
    expect(onFrame).toHaveBeenCalledTimes(1);
  });
});

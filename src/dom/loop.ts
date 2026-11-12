import { Controller } from "./Controller";

export type FrameCallback = (dtMs: number, timeMs: number) => void;

/** Caps a frame's duration so a long pause (hidden tab) does not teleport anything. */
const MAX_FRAME_MS = 50;

/** Calls `onFrame` on every animation frame while started. */
export class AnimationLoop extends Controller {
  constructor(private readonly onFrame: FrameCallback) {
    super();
  }

  protected connect(signal: AbortSignal): void {
    let last = performance.now();
    let handle = 0;

    const frame = (time: number): void => {
      // The first frame's timestamp can be slightly earlier than `performance.now()`
      // read at start, which would give a negative duration: never go below 0.
      this.onFrame(Math.min(Math.max(time - last, 0), MAX_FRAME_MS), time);
      last = time;
      handle = requestAnimationFrame(frame);
    };

    handle = requestAnimationFrame(frame);
    signal.addEventListener("abort", () => cancelAnimationFrame(handle));
  }
}

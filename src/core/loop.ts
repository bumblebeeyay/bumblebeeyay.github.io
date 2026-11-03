export type FrameCallback = (dtMs: number, timeMs: number) => void;

/** Caps a frame's duration so a long pause (hidden tab) does not teleport anything. */
const MAX_FRAME_MS = 50;

/** Runs `onFrame` on every animation frame. Returns a function that stops the loop. */
export function startLoop(onFrame: FrameCallback): () => void {
  let last = performance.now();
  let handle = 0;

  const frame = (time: number): void => {
    onFrame(Math.min(time - last, MAX_FRAME_MS), time);
    last = time;
    handle = requestAnimationFrame(frame);
  };

  handle = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(handle);
}

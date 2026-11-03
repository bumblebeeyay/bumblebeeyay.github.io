import { add, scale, sub, type Vec2 } from './vec2';

/** Duration of one frame at 60 fps, the reference all rates are expressed in. */
const REFERENCE_FRAME_MS = 1000 / 60;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Turns a per-frame easing rate into the fraction to apply for a frame of `dtMs`,
 * so motion looks the same at 30, 60 or 144 fps.
 *
 * @param rate fraction of the remaining distance covered per 60 fps frame, in [0, 1]
 */
export function smoothingFactor(rate: number, dtMs: number): number {
  const r = clamp(rate, 0, 1);
  if (r === 0 || r === 1) return r;
  return 1 - Math.pow(1 - r, dtMs / REFERENCE_FRAME_MS);
}

/** Moves `current` toward `target` with frame-rate independent exponential easing. */
export function approach(current: Vec2, target: Vec2, rate: number, dtMs: number): Vec2 {
  return add(current, scale(sub(target, current), smoothingFactor(rate, dtMs)));
}

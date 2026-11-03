import { add, vec2, type Vec2 } from '../core/vec2';
import type { PointerSource } from '../input/PointerTracker';

/**
 * Decides where the bee wants to be. The bee only knows this interface,
 * so new ways of flying can be added without touching the Bee class.
 */
export interface BeeBehaviour {
  /** Fraction of the remaining distance flown per 60 fps frame: low = lazy, high = rushing. */
  readonly speed: number;
  /** Whether the bee bobs up and down while flying. */
  readonly bobs: boolean;
  /** Where the bee wants to be at `timeMs`, in viewport coordinates. */
  targetAt(timeMs: number): Vec2;
}

/** Flies straight to a fixed point, fast. */
export class FlyTo implements BeeBehaviour {
  readonly speed = 0.14;
  readonly bobs = false;

  constructor(private readonly destination: Vec2) {}

  targetAt(): Vec2 {
    return this.destination;
  }
}

export interface CirclingOptions {
  readonly speed: number;
  /** Size of the loop, horizontally and vertically. */
  readonly radius: Vec2;
  /** Duration of one loop. */
  readonly periodMs: number;
}

/** Drifts in lazy loops around a (possibly moving) point. */
export class Circling implements BeeBehaviour {
  readonly bobs = true;
  readonly speed: number;
  #lastCenter: Vec2;

  constructor(
    private readonly center: () => Vec2 | null,
    private readonly options: CirclingOptions,
  ) {
    this.speed = options.speed;
    this.#lastCenter = center() ?? vec2(innerWidth / 2, innerHeight / 2);
  }

  targetAt(timeMs: number): Vec2 {
    this.#lastCenter = this.center() ?? this.#lastCenter;
    const angle = (timeMs / this.options.periodMs) * Math.PI * 2;
    const { radius } = this.options;
    // Different speeds on each axis give a looser, less mechanical loop.
    return add(this.#lastCenter, vec2(Math.cos(angle) * radius.x, Math.sin(angle * 1.3) * radius.y));
  }
}

/** Lazily follows the pointer, staying a little up-left of it. Falls back when there is no pointer yet. */
export class FollowPointer implements BeeBehaviour {
  readonly speed = 0.022;
  readonly bobs = true;

  constructor(
    private readonly pointer: PointerSource,
    private readonly fallback: BeeBehaviour,
    private readonly offset: Vec2 = vec2(-34, -34),
  ) {}

  targetAt(timeMs: number): Vec2 {
    const { position } = this.pointer;
    return position ? add(position, this.offset) : this.fallback.targetAt(timeMs);
  }
}

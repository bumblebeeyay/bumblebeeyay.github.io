import { approach, clamp } from "../util/math";
import { distance, sub, vec2, type Vec2 } from "../util/vec2";
import { FlyTo, type BeeBehaviour } from "./behaviours";

/** How close counts as "arrived", in pixels. */
const ARRIVAL_RADIUS = 12;
const MAX_TILT_DEG = 25;
/**
 * Degrees of tilt per pixel moved this frame. The bee leans into its flight,
 * mostly from horizontal speed; climbing or diving only adds a little.
 */
const TILT_PER_PX_X = 2.2;
const TILT_PER_PX_Y = 0.6;
/** Below this horizontal speed (px per frame) the bee keeps its facing, so it does not flicker while hovering. */
const TURN_THRESHOLD_PX = 0.25;
const BOB_AMPLITUDE_PX = 4;
const BOB_PERIOD_MS = 1760;

interface PendingArrival {
  readonly destination: Vec2;
  readonly resolve: () => void;
  readonly timer: ReturnType<typeof setTimeout>;
}

/**
 * The bee: holds its position, eases toward whatever its current behaviour wants,
 * and draws itself (facing, tilt, bobbing).
 */
export class Bee {
  #position: Vec2;
  #facing: 1 | -1 = 1;
  #behaviour: BeeBehaviour;
  #arrival: PendingArrival | null = null;
  readonly #halfSize: Vec2;

  /** `element` must already be in the page, so its size can be measured. */
  constructor(
    private readonly element: HTMLElement,
    start: Vec2,
    behaviour: BeeBehaviour,
  ) {
    this.#position = start;
    this.#behaviour = behaviour;
    const { width, height } = element.getBoundingClientRect();
    this.#halfSize = vec2(width / 2, height / 2);
  }

  setBehaviour(behaviour: BeeBehaviour): void {
    this.#settleArrival();
    this.#behaviour = behaviour;
  }

  /** Rushes to `destination`. Resolves on arrival, or after `timeoutMs` at the latest. */
  flyTo(destination: Vec2, timeoutMs = 1200): Promise<void> {
    this.setBehaviour(new FlyTo(destination));
    return new Promise((resolve) => {
      const timer = setTimeout(() => this.#settleArrival(), timeoutMs);
      this.#arrival = { destination, resolve, timer };
    });
  }

  /** Advances the bee by one frame. */
  update(dtMs: number, timeMs: number): void {
    const target = this.#behaviour.targetAt(timeMs);
    const next = approach(this.#position, target, this.#behaviour.speed, dtMs);
    const velocity = sub(next, this.#position);
    this.#position = next;

    if (Math.abs(velocity.x) > TURN_THRESHOLD_PX)
      this.#facing = velocity.x < 0 ? -1 : 1;
    this.#render(velocity, timeMs);

    if (
      this.#arrival &&
      distance(this.#position, this.#arrival.destination) < ARRIVAL_RADIUS
    ) {
      this.#settleArrival();
    }
  }

  #render(velocity: Vec2, timeMs: number): void {
    const tilt = clamp(
      velocity.x * TILT_PER_PX_X + velocity.y * TILT_PER_PX_Y,
      -MAX_TILT_DEG,
      MAX_TILT_DEG,
    );
    const bob = this.#behaviour.bobs
      ? Math.sin((timeMs / BOB_PERIOD_MS) * Math.PI * 2) * BOB_AMPLITUDE_PX
      : 0;
    const x = this.#position.x - this.#halfSize.x;
    const y = this.#position.y - this.#halfSize.y + bob;
    this.element.style.transform = `translate(${x}px, ${y}px) scaleX(${this.#facing}) rotate(${tilt * this.#facing}deg)`;
  }

  #settleArrival(): void {
    if (!this.#arrival) return;
    clearTimeout(this.#arrival.timer);
    this.#arrival.resolve();
    this.#arrival = null;
  }
}

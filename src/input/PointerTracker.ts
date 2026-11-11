import { vec2, type Vec2 } from "../core/vec2";

/** Anything that knows where the pointer is. `null` until the pointer has moved. */
export interface PointerSource {
  readonly position: Vec2 | null;
}

/** Tracks the last known mouse, pen or touch position, in viewport coordinates. */
export class PointerTracker implements PointerSource {
  #position: Vec2 | null = null;

  constructor(target: Window = window) {
    target.addEventListener("pointermove", this.#update, { passive: true });
    target.addEventListener("pointerdown", this.#update, { passive: true });
  }

  get position(): Vec2 | null {
    return this.#position;
  }

  readonly #update = (event: PointerEvent): void => {
    this.#position = vec2(event.clientX, event.clientY);
  };
}

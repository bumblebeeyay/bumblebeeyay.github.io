import { Controller } from "../dom/Controller";
import { vec2, type Vec2 } from "../util/vec2";

/** Anything that knows where the pointer is. `null` until the pointer has moved. */
export interface PointerSource {
  readonly position: Vec2 | null;
}

/** Tracks the last known mouse, pen or touch position, in viewport coordinates. */
export class PointerTracker extends Controller implements PointerSource {
  #position: Vec2 | null = null;

  constructor(private readonly target: Window = window) {
    super();
  }

  get position(): Vec2 | null {
    return this.#position;
  }

  protected connect(signal: AbortSignal): void {
    const options = { passive: true, signal };
    this.target.addEventListener("pointermove", this.#update, options);
    this.target.addEventListener("pointerdown", this.#update, options);
  }

  readonly #update = (event: PointerEvent): void => {
    this.#position = vec2(event.clientX, event.clientY);
  };
}

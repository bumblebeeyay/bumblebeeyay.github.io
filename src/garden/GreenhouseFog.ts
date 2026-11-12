import { Controller } from "../dom/Controller";
import { GREENHOUSE_PANE_SELECTOR } from "../views/area";

const WIPED_CLASS = "is-wiped";

/**
 * Wipes the greenhouse's fogged panes clear where the pointer passes,
 * like a hand on cold glass. Panes do not catch the pointer (the plots behind
 * must stay clickable), so the pane under it is found from coordinates.
 * Keyboard focus on a plot clears the panes in front of it.
 *
 * Measuring panes forces layout, so pointer moves are handled at most once per frame,
 * and panes already wiped are never measured again.
 */
export class GreenhouseFog extends Controller {
  /** Panes still fogged. Wiped panes stay clear, so they leave this list for good. */
  #fogged: HTMLElement[];
  /** The latest pointer position waiting for the next frame, if any. */
  #pendingPointer: { readonly x: number; readonly y: number } | null = null;
  #frame = 0;

  constructor(private readonly greenhouse: HTMLElement) {
    super();
    this.#fogged = [
      ...greenhouse.querySelectorAll<HTMLElement>(GREENHOUSE_PANE_SELECTOR),
    ];
  }

  protected connect(signal: AbortSignal): void {
    const passive = { passive: true, signal };
    this.greenhouse.addEventListener(
      "pointermove",
      this.#handlePointer,
      passive,
    );
    this.greenhouse.addEventListener(
      "pointerdown",
      this.#handlePointer,
      passive,
    );
    this.greenhouse.addEventListener("focusin", this.#handleFocus, { signal });
    signal.addEventListener("abort", () => {
      cancelAnimationFrame(this.#frame);
      this.#pendingPointer = null;
    });
  }

  readonly #handlePointer = (event: PointerEvent): void => {
    if (this.#fogged.length === 0) return;
    const alreadyScheduled = this.#pendingPointer !== null;
    this.#pendingPointer = { x: event.clientX, y: event.clientY };
    if (alreadyScheduled) return;
    this.#frame = requestAnimationFrame(() => {
      const point = this.#pendingPointer;
      this.#pendingPointer = null;
      if (point) this.#wipeWhere((rect) => contains(rect, point.x, point.y));
    });
  };

  readonly #handleFocus = (event: FocusEvent): void => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.getBoundingClientRect();
    this.#wipeWhere((rect) => overlaps(rect, target));
  };

  #wipeWhere(test: (rect: DOMRect) => boolean): void {
    this.#fogged = this.#fogged.filter((pane) => {
      if (!test(pane.getBoundingClientRect())) return true;
      pane.classList.add(WIPED_CLASS);
      return false;
    });
  }
}

const contains = (r: DOMRect, x: number, y: number): boolean =>
  x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

const overlaps = (a: DOMRect, b: DOMRect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

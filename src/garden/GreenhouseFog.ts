const WIPED_CLASS = "is-wiped";

/**
 * Wipes the greenhouse's fogged panes clear where the pointer passes,
 * like a hand on cold glass. Panes do not catch the pointer (the plots behind
 * must stay clickable), so the pane under it is found from coordinates.
 * Keyboard focus on a plot clears the panes in front of it.
 */
export class GreenhouseFog {
  readonly #panes: HTMLElement[];

  constructor(private readonly greenhouse: HTMLElement) {
    this.#panes = [
      ...greenhouse.querySelectorAll<HTMLElement>(".greenhouse__pane"),
    ];
  }

  start(): void {
    this.greenhouse.addEventListener("pointermove", this.#handlePointer, {
      passive: true,
    });
    this.greenhouse.addEventListener("pointerdown", this.#handlePointer, {
      passive: true,
    });
    this.greenhouse.addEventListener("focusin", this.#handleFocus);
  }

  readonly #handlePointer = (event: PointerEvent): void => {
    this.#wipeWhere((rect) => contains(rect, event.clientX, event.clientY));
  };

  readonly #handleFocus = (event: FocusEvent): void => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.getBoundingClientRect();
    this.#wipeWhere((rect) => overlaps(rect, target));
  };

  #wipeWhere(test: (rect: DOMRect) => boolean): void {
    for (const pane of this.#panes) {
      if (
        !pane.classList.contains(WIPED_CLASS) &&
        test(pane.getBoundingClientRect())
      ) {
        pane.classList.add(WIPED_CLASS);
      }
    }
  }
}

const contains = (r: DOMRect, x: number, y: number): boolean =>
  x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

const overlaps = (a: DOMRect, b: DOMRect): boolean =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const DRAG_THRESHOLD_PX = 6;
const LINE_HEIGHT_PX = 40;

type ScrollListener = (scrollLeft: number) => void;

/**
 * The garden is one long horizontal strip. This turns every usual way of moving
 * into sideways scrolling: mouse wheel, dragging with the mouse, and the keyboard.
 * Touch screens keep their native swipe.
 *
 * It also publishes the scroll position as `--scroll-x` on `scene`, which the
 * parallax layers read in CSS.
 */
export class WorldScroller {
  readonly #listeners: ScrollListener[] = [];
  #frame = 0;
  #drag: {
    readonly startX: number;
    readonly startScroll: number;
    moved: boolean;
  } | null = null;
  /** While false (a project is open), keys and wheel are left alone. */
  enabled = true;

  constructor(
    readonly viewport: HTMLElement,
    private readonly scene: HTMLElement,
    private readonly reducedMotion: boolean,
  ) {}

  start(): void {
    this.viewport.addEventListener("scroll", this.#handleScroll, {
      passive: true,
    });
    this.viewport.addEventListener("wheel", this.#handleWheel, {
      passive: false,
    });
    this.viewport.addEventListener("pointerdown", this.#handleDragStart);
    this.viewport.addEventListener("click", this.#swallowClickAfterDrag, {
      capture: true,
    });
    window.addEventListener("keydown", this.#handleKey);
    window.addEventListener("resize", this.#handleScroll, { passive: true });
    this.#publish();
  }

  get scrollLeft(): number {
    return this.viewport.scrollLeft;
  }

  /** Calls `listener` now and after every scroll, at most once per frame. */
  onScroll(listener: ScrollListener): void {
    this.#listeners.push(listener);
    listener(this.scrollLeft);
  }

  /** Scrolls so `element` starts a little in from the left edge. */
  scrollToElement(element: HTMLElement, { instant = false } = {}): void {
    this.scrollTo(
      element.offsetLeft - Math.min(40, this.viewport.clientWidth * 0.05),
      instant,
    );
  }

  /** Scrolls so `element` is centered, e.g. a plot before visiting it. */
  centerOn(element: HTMLElement, { instant = false } = {}): void {
    const { left, width } = element.getBoundingClientRect();
    const target =
      this.scrollLeft + left + width / 2 - this.viewport.clientWidth / 2;
    this.scrollTo(target, instant);
  }

  scrollTo(left: number, instant = false): void {
    this.viewport.scrollTo({
      left,
      behavior: instant || this.reducedMotion ? "instant" : "smooth",
    });
  }

  readonly #handleScroll = (): void => {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#publish();
    });
  };

  #publish(): void {
    const x = this.scrollLeft;
    this.scene.style.setProperty("--scroll-x", String(Math.round(x)));
    for (const listener of this.#listeners) listener(x);
  }

  /** A vertical wheel moves the world sideways. Horizontal wheels and trackpads already do. */
  readonly #handleWheel = (event: WheelEvent): void => {
    if (!this.enabled || event.ctrlKey) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const unit =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE_HEIGHT_PX : 1;
    this.viewport.scrollLeft += event.deltaY * unit;
    event.preventDefault();
  };

  readonly #handleDragStart = (event: PointerEvent): void => {
    if (!this.enabled || event.pointerType !== "mouse" || event.button !== 0)
      return;
    this.#drag = {
      startX: event.clientX,
      startScroll: this.scrollLeft,
      moved: false,
    };
    window.addEventListener("pointermove", this.#handleDragMove);
    window.addEventListener("pointerup", this.#handleDragEnd, { once: true });
  };

  readonly #handleDragMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    if (!drag.moved) {
      drag.moved = true;
      this.viewport.classList.add("is-dragging");
    }
    // `instant` so the world sticks to the hand instead of easing after it.
    this.viewport.scrollTo({
      left: drag.startScroll - dx,
      behavior: "instant",
    });
  };

  readonly #handleDragEnd = (): void => {
    window.removeEventListener("pointermove", this.#handleDragMove);
    this.viewport.classList.remove("is-dragging");
    // Keep `#drag` until the click that follows the release has been swallowed.
    if (!this.#drag?.moved) this.#drag = null;
    else setTimeout(() => (this.#drag = null));
  };

  /** A drag ends with a click on whatever is under the mouse; it must not open a flower. */
  readonly #swallowClickAfterDrag = (event: MouseEvent): void => {
    if (!this.#drag?.moved) return;
    event.stopPropagation();
    event.preventDefault();
    this.#drag = null;
  };

  readonly #handleKey = (event: KeyboardEvent): void => {
    if (
      !this.enabled ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (isTyping(event.target)) return;

    const width = this.viewport.clientWidth;
    const steps: Partial<Record<string, number>> = {
      ArrowRight: width * 0.35,
      ArrowDown: width * 0.35,
      ArrowLeft: -width * 0.35,
      ArrowUp: -width * 0.35,
      PageDown: width * 0.85,
      PageUp: -width * 0.85,
    };
    const step = steps[event.key];

    if (step !== undefined) {
      this.scrollTo(this.scrollLeft + step);
    } else if (event.key === "Home") {
      this.scrollTo(0);
    } else if (event.key === "End") {
      this.scrollTo(this.viewport.scrollWidth);
    } else {
      return;
    }
    event.preventDefault();
  };
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

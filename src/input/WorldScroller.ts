import { Controller } from "../dom/Controller";
import { Store, type ReadonlyStore } from "../util/store";

const DRAG_THRESHOLD_PX = 6;
const LINE_HEIGHT_PX = 40;
/** Arrow keys walk about a third of the screen: the next plot comes into view, the last one stays. */
const ARROW_STEP = 0.35;
/** Page keys walk almost a whole screen, keeping a strip of the old one for context. */
const PAGE_STEP = 0.85;

/** The part of the garden on screen, in the track's coordinates. */
export interface VisibleStrip {
  readonly left: number;
  readonly width: number;
}

interface Drag {
  readonly startX: number;
  readonly startScroll: number;
  moved: boolean;
  /** Removes the window listeners added for this drag only. */
  readonly listeners: AbortController;
}

/**
 * The garden is one long horizontal strip. This turns every usual way of moving
 * into sideways scrolling: mouse wheel, dragging with the mouse, and the keyboard.
 * Touch screens keep their native swipe.
 *
 * It also publishes the scroll position as `--scroll-x` on `scene`, which the
 * parallax layers read in CSS.
 */
export class WorldScroller extends Controller {
  #frame = 0;
  #drag: Drag | null = null;
  /** While false (a project is open), keys and wheel are left alone. */
  enabled = true;

  /**
   * A new strip on every scroll or resize, at most once per frame. A resize can change
   * what is in the middle of the screen without scrolling, hence the width.
   */
  readonly #strip: Store<VisibleStrip>;
  readonly strip: ReadonlyStore<VisibleStrip>;

  constructor(
    readonly viewport: HTMLElement,
    private readonly scene: HTMLElement,
    private readonly reducedMotion: boolean,
  ) {
    super();
    this.#strip = new Store(this.#measure());
    this.strip = this.#strip;
  }

  protected connect(signal: AbortSignal): void {
    const { viewport } = this;
    const win = viewport.ownerDocument.defaultView ?? window;
    viewport.addEventListener("scroll", this.#handleScroll, {
      passive: true,
      signal,
    });
    viewport.addEventListener("wheel", this.#handleWheel, {
      passive: false,
      signal,
    });
    viewport.addEventListener("pointerdown", this.#handleDragStart, { signal });
    viewport.addEventListener("click", this.#swallowClickAfterDrag, {
      capture: true,
      signal,
    });
    win.addEventListener("keydown", this.#handleKey, { signal });
    win.addEventListener("resize", this.#handleScroll, {
      passive: true,
      signal,
    });
    signal.addEventListener("abort", () => {
      cancelAnimationFrame(this.#frame);
      this.#frame = 0;
      this.#endDrag();
    });
    this.#publish();
  }

  get scrollLeft(): number {
    return this.viewport.scrollLeft;
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

  #measure(): VisibleStrip {
    return { left: this.scrollLeft, width: this.viewport.clientWidth };
  }

  #publish(): void {
    const strip = this.#measure();
    this.scene.style.setProperty("--scroll-x", String(Math.round(strip.left)));
    this.#strip.set(strip);
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
    const listeners = new AbortController();
    this.#drag = {
      startX: event.clientX,
      startScroll: this.scrollLeft,
      moved: false,
      listeners,
    };
    const win = this.viewport.ownerDocument.defaultView ?? window;
    const { signal } = listeners;
    win.addEventListener("pointermove", this.#handleDragMove, { signal });
    win.addEventListener("pointerup", this.#handleDragEnd, { signal });
    // A cancelled pointer (native drag and drop, lost focus) never sends pointerup.
    win.addEventListener("pointercancel", this.#handleDragEnd, { signal });
  };

  readonly #handleDragMove = (event: PointerEvent): void => {
    const drag = this.#drag;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return;
    if (!drag.moved) {
      drag.moved = true;
      this.viewport.classList.add("is-dragging");
      // Keep receiving the pointer even if it leaves the window mid-drag.
      // Only from here on, so a plain click still reaches the plot under it.
      this.viewport.setPointerCapture(event.pointerId);
    }
    // `instant` so the world sticks to the hand instead of easing after it.
    this.viewport.scrollTo({
      left: drag.startScroll - dx,
      behavior: "instant",
    });
  };

  readonly #handleDragEnd = (): void => {
    const drag = this.#drag;
    drag?.listeners.abort();
    this.viewport.classList.remove("is-dragging");
    // Keep `#drag` until the click that follows the release has been swallowed.
    if (!drag?.moved) this.#drag = null;
    else setTimeout(() => (this.#drag = null));
  };

  /** Drops any drag at once, e.g. when the scroller is destroyed mid-drag. */
  #endDrag(): void {
    this.#drag?.listeners.abort();
    this.#drag = null;
    this.viewport.classList.remove("is-dragging");
  }

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
      ArrowRight: width * ARROW_STEP,
      ArrowDown: width * ARROW_STEP,
      ArrowLeft: -width * ARROW_STEP,
      ArrowUp: -width * ARROW_STEP,
      PageDown: width * PAGE_STEP,
      PageUp: -width * PAGE_STEP,
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

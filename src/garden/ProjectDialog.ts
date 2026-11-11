import { Emitter, type Subscribable } from "../util/emitter";
import type { Vec2 } from "../util/vec2";
import { Controller } from "../dom/Controller";
import { h } from "../dom/create";
import { viewportCenter } from "../dom/geometry";
import { nextPaint, waitForTransition } from "../dom/transition";
import type { PlantedProject } from "../domain/garden";
import { FLOWER_HEAD_SELECTOR } from "../flower/renderFlower";
import { renderHerbariumSheet } from "../views/herbarium";
import { SHEET_TITLE_ID } from "../views/ids";
import { chevronLeftIcon, chevronRightIcon, closeIcon } from "../views/icons";

const VISIBLE_CLASS = "is-visible";
const CLOSE_ANIMATION_MS = 500;

export type Direction = -1 | 1;

/**
 * The close-up of one project: a herbarium sheet with its pressed flower and notes.
 * Uses a non-modal <dialog> so the bee can keep flying above it; the garden
 * behind is made inert by the camera, so focus cannot wander there.
 */
export class ProjectDialog extends Controller {
  readonly element: HTMLDialogElement;
  readonly #sheet: HTMLElement;
  readonly #closeButton: HTMLButtonElement;
  readonly #previousButton: HTMLButtonElement;
  readonly #nextButton: HTMLButtonElement;

  readonly #closeRequested = new Emitter();
  /** The visitor asks to leave: back button, Escape, or a click beside the sheet. */
  readonly closeRequested: Subscribable<void> = this.#closeRequested;

  readonly #stepRequested = new Emitter<Direction>();
  /** The visitor asks for the previous or next sheet: buttons or left/right arrow keys. */
  readonly stepRequested: Subscribable<Direction> = this.#stepRequested;

  constructor(private readonly brand: string) {
    super();
    this.#closeButton = h(
      "button",
      { type: "button", class: "pill herbarium__back" },
      closeIcon(),
      h("span", {}, "Back to the garden"),
    );
    this.#previousButton = h(
      "button",
      {
        type: "button",
        class: "round-button herbarium__step herbarium__step--previous",
        "aria-label": "Previous flower",
      },
      chevronLeftIcon(),
    );
    this.#nextButton = h(
      "button",
      {
        type: "button",
        class: "round-button herbarium__step herbarium__step--next",
        "aria-label": "Next flower",
      },
      chevronRightIcon(),
    );
    this.#sheet = h("article", {
      class: "sheet",
      "aria-labelledby": SHEET_TITLE_ID,
    });

    this.element = h(
      "dialog",
      { class: "herbarium", "aria-labelledby": SHEET_TITLE_ID },
      this.#closeButton,
      this.#previousButton,
      this.#sheet,
      this.#nextButton,
    );
  }

  protected connect(signal: AbortSignal): void {
    this.#closeButton.addEventListener(
      "click",
      () => this.#closeRequested.emit(),
      { signal },
    );
    this.#previousButton.addEventListener(
      "click",
      () => this.#stepRequested.emit(-1),
      { signal },
    );
    this.#nextButton.addEventListener(
      "click",
      () => this.#stepRequested.emit(1),
      { signal },
    );
    this.element.addEventListener("click", this.#handleBackdropClick, {
      signal,
    });
    // On the document: the keys must work wherever focus is inside the open sheet.
    this.element.ownerDocument.addEventListener(
      "keydown",
      this.#handleKeydown,
      {
        signal,
      },
    );
  }

  get isOpen(): boolean {
    return this.element.open;
  }

  /** Where the pressed flower's heart is on screen, or null when closed. */
  get flowerHeadPosition(): Vec2 | null {
    const head = this.isOpen
      ? this.#sheet.querySelector(FLOWER_HEAD_SELECTOR)
      : null;
    return head ? viewportCenter(head) : null;
  }

  async open(entry: PlantedProject): Promise<void> {
    this.show(entry);
    this.element.show();
    this.#closeButton.focus({ preventScroll: true });
    await nextPaint();
    this.element.classList.add(VISIBLE_CLASS);
  }

  /** Puts another project on the sheet, without closing. */
  show(entry: PlantedProject): void {
    this.#sheet.replaceChildren(renderHerbariumSheet(entry, this.brand));
    this.#sheet.scrollTop = 0;
  }

  async close(): Promise<void> {
    if (!this.isOpen) return;
    this.element.classList.remove(VISIBLE_CLASS);
    await waitForTransition(this.element, CLOSE_ANIMATION_MS);
    this.element.close();
  }

  readonly #handleBackdropClick = (event: MouseEvent): void => {
    if (event.target === this.element) this.#closeRequested.emit();
  };

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    if (!this.isOpen || event.defaultPrevented) return;
    if (event.key === "Escape") {
      this.#closeRequested.emit();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      this.#stepRequested.emit(event.key === "ArrowLeft" ? -1 : 1);
    } else {
      return;
    }
    event.preventDefault();
  };
}

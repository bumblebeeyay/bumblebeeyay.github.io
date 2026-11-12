import { Controller } from "../dom/Controller";
import { h } from "../dom/create";
import { Emitter, type Subscribable } from "../util/emitter";
import type { Area } from "../domain/types";
import { closeIcon } from "../views/icons";
import { LIST_TITLE_ID } from "../views/ids";
import { renderProjectList, showProjectId } from "../views/list";

/**
 * Every project as a plain list, for visitors in a hurry.
 * A modal dialog: the browser keeps focus inside and Escape closes it.
 * The list itself is drawn by `views/list.ts`; this class only owns the dialog's behaviour.
 */
export class ListDialog extends Controller {
  readonly element: HTMLDialogElement;
  readonly #closeButton: HTMLButtonElement;

  readonly #showRequested = new Emitter<string>();
  /** The visitor picked a project to see in the garden; the dialog is already closed. */
  readonly showRequested: Subscribable<string> = this.#showRequested;

  readonly #closed = new Emitter();
  /** The dialog closed, whatever the reason (button, backdrop, Escape, a pick). */
  readonly closed: Subscribable<void> = this.#closed;

  constructor(areas: readonly Area[]) {
    super();
    const closeButton = h(
      "button",
      { type: "button", class: "pill list-dialog__close" },
      closeIcon(),
      h("span", {}, "Back to the garden"),
    );
    this.element = h(
      "dialog",
      { class: "list-dialog", "aria-labelledby": LIST_TITLE_ID },
      h(
        "div",
        { class: "list-dialog__head" },
        h(
          "h2",
          { id: LIST_TITLE_ID, class: "list-dialog__title" },
          "All projects",
        ),
        closeButton,
      ),
      ...renderProjectList(areas),
    );
    this.#closeButton = closeButton;
  }

  protected connect(signal: AbortSignal): void {
    this.#closeButton.addEventListener("click", () => this.element.close(), {
      signal,
    });
    this.element.addEventListener("close", () => this.#closed.emit(), {
      signal,
    });
    this.element.addEventListener("click", this.#handleClick, { signal });
  }

  open(): void {
    this.element.showModal();
  }

  readonly #handleClick = (event: MouseEvent): void => {
    // A click on the dimmed backdrop lands on the dialog element itself.
    if (event.target === this.element) {
      this.element.close();
      return;
    }
    const projectId = showProjectId(event.target);
    if (projectId === null) return;
    this.element.close();
    this.#showRequested.emit(projectId);
  };
}

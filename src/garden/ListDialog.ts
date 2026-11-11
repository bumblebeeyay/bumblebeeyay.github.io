import { h } from "../dom/create";
import type { Area } from "../domain/types";
import { closeIcon } from "../views/icons";
import { LIST_TITLE_ID } from "../views/ids";
import { renderProjectList, showProjectId } from "../views/list";

/**
 * Every project as a plain list, for visitors in a hurry.
 * A modal dialog: the browser keeps focus inside and Escape closes it.
 * The list itself is drawn by `views/list.ts`; this class only owns the dialog's behaviour.
 */
export class ListDialog {
  readonly element: HTMLDialogElement;
  #onShowInGarden: (projectId: string) => void = () => undefined;
  #onClose: () => void = () => undefined;

  constructor(areas: readonly Area[]) {
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
    closeButton.addEventListener("click", () => this.element.close());
    this.element.addEventListener("close", () => this.#onClose());
    this.element.addEventListener("click", this.#handleClick);
  }

  onShowInGarden(handler: (projectId: string) => void): void {
    this.#onShowInGarden = handler;
  }

  onClose(handler: () => void): void {
    this.#onClose = handler;
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
    this.#onShowInGarden(projectId);
  };
}

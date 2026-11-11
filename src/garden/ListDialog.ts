import { h } from "../dom/create";
import type { Area, Project, ProjectLink } from "../domain/types";
import { closeIcon } from "../views/icons";

/**
 * Every project as a plain list, for visitors in a hurry.
 * A modal dialog: the browser keeps focus inside and Escape closes it.
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
      { class: "list-dialog", "aria-labelledby": "list-title" },
      h(
        "div",
        { class: "list-dialog__head" },
        h(
          "h2",
          { id: "list-title", class: "list-dialog__title" },
          "All projects",
        ),
        closeButton,
      ),
      ...areas.map((area) => this.#renderArea(area)),
    );
    closeButton.addEventListener("click", () => this.element.close());
    this.element.addEventListener("close", () => this.#onClose());
    // A click on the dimmed backdrop lands on the dialog element itself.
    this.element.addEventListener("click", (event) => {
      if (event.target === this.element) this.element.close();
    });
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

  #renderArea(area: Area): HTMLElement {
    return h(
      "section",
      { class: "list-dialog__area", "aria-labelledby": `list-${area.id}` },
      h(
        "h3",
        { id: `list-${area.id}` },
        area.title,
        h("span", {}, ` · ${area.tagline}`),
      ),
      h(
        "ul",
        {},
        ...area.projects.map((project) => this.#renderProject(project)),
      ),
    );
  }

  #renderProject(project: Project): HTMLElement {
    const show = h(
      "button",
      { type: "button", class: "list-dialog__show" },
      "See its flower",
    );
    show.addEventListener("click", () => {
      this.element.close();
      this.#onShowInGarden(project.id);
    });
    return h(
      "li",
      { class: "list-dialog__project" },
      h("span", {
        class: "list-dialog__dot",
        style: `background: ${project.flower.petal}; border-color: ${project.flower.outline}`,
      }),
      h(
        "div",
        {},
        h(
          "p",
          { class: "list-dialog__name" },
          h("strong", {}, project.title),
          ` · ${project.summary}`,
        ),
        h("p", { class: "list-dialog__description" }, project.description),
        h(
          "p",
          { class: "list-dialog__links" },
          ...project.links.map(renderLink),
          show,
        ),
      ),
    );
  }
}

function renderLink(link: ProjectLink): HTMLElement {
  return link.href === undefined
    ? h("span", {}, link.label)
    : h(
        "a",
        { href: link.href, target: "_blank", rel: "noopener noreferrer" },
        link.label,
      );
}

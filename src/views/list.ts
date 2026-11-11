import { h } from "../dom/create";
import type { Area, Project, ProjectLink } from "../domain/types";
import { listAreaTitleId } from "./ids";
import { externalLink } from "./links";

/** Marks a "See its flower" button. Its value is the project id. */
export const SHOW_PROJECT_ATTRIBUTE = "data-show-project";

/** The project a click asks to see in the garden, or null if it hit no such button. */
export function showProjectId(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  return (
    target
      .closest(`[${SHOW_PROJECT_ATTRIBUTE}]`)
      ?.getAttribute(SHOW_PROJECT_ATTRIBUTE) ?? null
  );
}

function renderLink(link: ProjectLink): HTMLElement {
  return link.href === undefined
    ? h("span", {}, link.label)
    : externalLink(link.href, {}, link.label);
}

function renderProject(project: Project): HTMLElement {
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
        h(
          "button",
          {
            type: "button",
            class: "list-dialog__show",
            [SHOW_PROJECT_ATTRIBUTE]: project.id,
          },
          "See its flower",
        ),
      ),
    ),
  );
}

function renderArea(area: Area): HTMLElement {
  const titleId = listAreaTitleId(area.id);
  return h(
    "section",
    { class: "list-dialog__area", "aria-labelledby": titleId },
    h("h3", { id: titleId }, area.title, h("span", {}, ` · ${area.tagline}`)),
    h("ul", {}, ...area.projects.map(renderProject)),
  );
}

/** Every project as a plain list, one section per area. */
export function renderProjectList(areas: readonly Area[]): HTMLElement[] {
  return areas.map(renderArea);
}

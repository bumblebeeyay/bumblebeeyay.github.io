import { hashString } from "../util/random";
import { h } from "../dom/create";
import type { Project } from "../domain/types";
import { renderFlower } from "../flower/renderFlower";
import { sparkle } from "./icons";

/** Attribute linking a plot in the DOM to its project. */
export const PROJECT_ID_ATTRIBUTE = "data-project-id";
export const PLOT_SELECTOR = `[${PROJECT_ID_ATTRIBUTE}]`;

const VISITED_CLASS = "is-visited";

/** Flowers grow from 92% to just under 117% of their size, so a row never looks printed. */
const MIN_GROWTH = 0.92;
const GROWTH_RANGE = 0.25;
/** The scale for one project: seeded by its id, so it is the same on every visit. */
const growthOf = (projectId: string): number =>
  MIN_GROWTH + ((hashString(projectId) % 100) / 100) * GROWTH_RANGE;

/** A small engraved label on a stake, like the ones naming plants in botanical gardens. */
function renderPlantLabel(project: Project): HTMLSpanElement {
  return h(
    "span",
    { class: "plant-label" },
    h(
      "span",
      { class: "plant-label__plate" },
      h("span", { class: "plant-label__title" }, project.title),
      h("span", { class: "plant-label__line" }, project.summary),
      h("span", { class: "plant-label__badge" }, "visited"),
    ),
    h("span", { class: "plant-label__stake" }),
  );
}

/** What a screen reader announces for a plot. Shared by the first render and every visit. */
export const plotLabel = (project: Project, visited: boolean): string =>
  `${project.title}${visited ? ", visited" : ""}: open the project page`;

/**
 * One project in the garden: its label and its flower. The whole plot is one button.
 * Each flower grows to its own height, so the row looks planted, not printed.
 */
export function renderPlot(project: Project): HTMLButtonElement {
  return h(
    "button",
    {
      type: "button",
      class: "plot",
      [PROJECT_ID_ATTRIBUTE]: project.id,
      "aria-haspopup": "dialog",
      "aria-label": plotLabel(project, false),
      style: `--growth: ${growthOf(project.id).toFixed(3)}`,
    },
    renderPlantLabel(project),
    h(
      "span",
      { class: "plot__plant" },
      renderFlower(project.flower),
      sparkle("plot__sparkle plot__sparkle--1"),
      sparkle("plot__sparkle plot__sparkle--2"),
      sparkle("plot__sparkle plot__sparkle--3"),
    ),
  );
}

export function setPlotVisited(
  plot: HTMLElement,
  project: Project,
  visited: boolean,
): void {
  plot.classList.toggle(VISITED_CLASS, visited);
  plot.setAttribute("aria-label", plotLabel(project, visited));
}

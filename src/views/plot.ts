import { hashString } from "../core/random";
import { h } from "../dom/create";
import type { Project } from "../domain/types";
import { renderFlower } from "../flower/renderFlower";
import { sparkle } from "./icons";

/** Attribute linking a plot in the DOM to its project. */
export const PROJECT_ID_ATTRIBUTE = "data-project-id";
export const PLOT_SELECTOR = `[${PROJECT_ID_ATTRIBUTE}]`;

const VISITED_CLASS = "is-visited";

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

/**
 * One project in the garden: its label and its flower. The whole plot is one button.
 * Each flower grows to its own height, so the row looks planted, not printed.
 */
export function renderPlot(project: Project): HTMLButtonElement {
  const growth = 0.92 + (hashString(project.id) % 100) / 400;
  return h(
    "button",
    {
      type: "button",
      class: "plot",
      [PROJECT_ID_ATTRIBUTE]: project.id,
      "aria-haspopup": "dialog",
      "aria-label": `${project.title}: open the project page`,
      style: `--growth: ${growth.toFixed(3)}`,
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
  title: string,
  visited: boolean,
): void {
  plot.classList.toggle(VISITED_CLASS, visited);
  plot.setAttribute(
    "aria-label",
    `${title}${visited ? ", visited" : ""}: open the project page`,
  );
}

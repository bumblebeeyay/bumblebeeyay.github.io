import { h } from "../dom/create";
import type { PlantedProject } from "../domain/garden";
import type { FlowerSpec, ProjectLink } from "../domain/types";
import { renderFlower, setBloomed } from "../flower/renderFlower";
import { SHEET_TITLE_ID } from "./ids";
import { externalLink } from "./links";

/** Specimen numbers have at least two digits, like "03". */
const padNumber = (n: number): string => String(n).padStart(2, "0");

/** "No. 03" */
export const specimenNumber = (n: number): string => `No. ${padNumber(n)}`;

function bloomedFlower(spec: FlowerSpec, className: string): SVGSVGElement {
  const flower = renderFlower(spec);
  flower.classList.add(className);
  setBloomed(flower, true);
  return flower;
}

/** Links are seed packets: take some home. A link without address is a plain note. */
function renderLink(link: ProjectLink, flower: FlowerSpec): HTMLElement {
  if (link.href === undefined)
    return h("li", { class: "sheet__note" }, link.label);
  return h(
    "li",
    {},
    externalLink(
      link.href,
      { class: "seed-packet" },
      bloomedFlower(flower, "seed-packet__flower"),
      h(
        "span",
        { class: "seed-packet__kicker", "aria-hidden": "true" },
        "Seeds of",
      ),
      h("span", { class: "seed-packet__label" }, link.label),
    ),
  );
}

/** The pressed flower and its label, the left half of the sheet. */
function renderSpecimen(
  { project, area, number }: PlantedProject,
  brand: string,
): HTMLElement {
  return h(
    "div",
    { class: "sheet__specimen" },
    h(
      "div",
      { class: "sheet__pressed" },
      bloomedFlower(project.flower, "sheet__flower"),
      h("span", { class: "sheet__tape sheet__tape--1", "aria-hidden": "true" }),
      h("span", { class: "sheet__tape sheet__tape--2", "aria-hidden": "true" }),
    ),
    h(
      "dl",
      { class: "specimen-label" },
      h("div", { class: "specimen-label__head" }, `Herbarium Apis · ${brand}`),
      h("div", {}, h("dt", {}, "No."), h("dd", {}, padNumber(number))),
      h(
        "div",
        {},
        h("dt", {}, "Habitat:"),
        h("dd", {}, area.title.toLowerCase()),
      ),
      h(
        "div",
        {},
        h("dt", {}, "Det.:"),
        h("dd", { class: "handwritten" }, brand),
      ),
    ),
  );
}

/** A whole herbarium sheet for one project. */
export function renderHerbariumSheet(
  entry: PlantedProject,
  brand: string,
): HTMLElement {
  const { project, area, number } = entry;
  return h(
    "div",
    { class: "sheet__content" },
    renderSpecimen(entry, brand),
    h(
      "div",
      { class: "sheet__notes" },
      h(
        "p",
        { class: "sheet__kicker" },
        `${specimenNumber(number)} · ${area.title}`,
      ),
      h("h2", { class: "sheet__title", id: SHEET_TITLE_ID }, project.title),
      h("p", { class: "sheet__summary" }, project.summary),
      h("p", { class: "sheet__description handwritten" }, project.description),
      project.tags.length > 0 &&
        h(
          "ul",
          { class: "sheet__stamps", "aria-label": "Made with" },
          ...project.tags.map((tag) => h("li", {}, tag)),
        ),
      project.links.length > 0 &&
        h(
          "ul",
          { class: "sheet__links" },
          ...project.links.map((link) => renderLink(link, project.flower)),
        ),
      h(
        "p",
        { class: "visited-stamp" },
        h("span", { class: "visited-stamp__word" }, "Visited"),
      ),
    ),
  );
}

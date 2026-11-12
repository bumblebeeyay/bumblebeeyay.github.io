import { h } from "../dom/create";
import type { Area } from "../domain/types";
import { lockIcon } from "./icons";
import { areaTitleId } from "./ids";
import { goTo } from "./navigation";
import { renderPlot } from "./plot";

export const GREENHOUSE_SELECTOR = ".greenhouse";
export const GREENHOUSE_PANE_SELECTOR = ".greenhouse__pane";

/** Panes per plot in the greenhouse wall. */
const PANES_PER_PLOT = 2;
const PANE_ROWS = 3;

/** The tall sign at the start of an area. */
function renderSignpost(area: Area, titleId: string): HTMLElement {
  return h(
    "div",
    { class: "signpost" },
    h("span", { class: "signpost__post", "aria-hidden": "true" }),
    h(
      "div",
      { class: "signpost__board" },
      h("h2", { class: "signpost__title", id: titleId }, area.title),
      h("p", { class: "signpost__tagline" }, area.tagline),
    ),
  );
}

/** The arrow-shaped sign at the end of an area, pointing to the next one. */
function renderArrowSign(next: Area): HTMLElement {
  return h(
    "button",
    { type: "button", class: "arrow-sign", ...goTo(next.id) },
    h("span", { class: "arrow-sign__post", "aria-hidden": "true" }),
    h(
      "span",
      { class: "arrow-sign__board" },
      h("span", { class: "visually-hidden" }, "Go to "),
      next.title,
    ),
  );
}

/**
 * Private projects grow behind fogged glass: you can see them, not touch them.
 * The panes are drawn over the plots but let clicks through.
 */
function renderGreenhouse(area: Area): HTMLElement {
  const columns = Math.max(4, area.projects.length * PANES_PER_PLOT);
  const panes = Array.from({ length: columns * PANE_ROWS }, () =>
    h("span", { class: "greenhouse__pane" }),
  );
  return h(
    "div",
    { class: "greenhouse", style: `--columns: ${columns}` },
    h("div", { class: "greenhouse__plots" }, ...area.projects.map(renderPlot)),
    h("div", { class: "greenhouse__glass", "aria-hidden": "true" }, ...panes),
    h("span", { class: "greenhouse__roof", "aria-hidden": "true" }),
    area.note !== undefined &&
      h(
        "p",
        { class: "hanging-sign greenhouse__sign" },
        lockIcon(),
        h("span", {}, area.note),
      ),
    h("span", { class: "greenhouse__footing", "aria-hidden": "true" }),
  );
}

function renderPlotsRow(area: Area): HTMLElement {
  return h(
    "div",
    { class: "area__plots" },
    ...area.projects.map(renderPlot),
    area.note !== undefined &&
      h("p", { class: "hanging-sign area__note" }, area.note),
  );
}

/** One part of the garden: its signpost, its plants, and the way on. */
export function renderArea(area: Area, next: Area | undefined): HTMLElement {
  const titleId = areaTitleId(area.id);
  return h(
    "section",
    {
      class: `area area--${area.setting}`,
      id: area.id,
      "aria-labelledby": titleId,
    },
    renderSignpost(area, titleId),
    area.setting === "greenhouse"
      ? renderGreenhouse(area)
      : renderPlotsRow(area),
    next && renderArrowSign(next),
  );
}

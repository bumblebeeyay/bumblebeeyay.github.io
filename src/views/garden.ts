import { h } from "../dom/create";
import type { GardenContent } from "../domain/types";
import { GREENHOUSE_SELECTOR, renderArea } from "./area";
import { renderHive } from "./hive";
import { PLOT_SELECTOR, PROJECT_ID_ATTRIBUTE } from "./plot";
import { renderBackdrop, renderFrontGrass } from "./scenery";

export interface GardenScene {
  /** Everything the camera zooms: backdrop, world, front grass. */
  readonly scene: HTMLElement;
  /** The horizontal scroll container. */
  readonly viewport: HTMLElement;
  /** The hive, then one section per area, left to right. */
  readonly places: readonly HTMLElement[];
  /** Every plot, by project id, in walking order. */
  readonly plots: ReadonlyMap<string, HTMLElement>;
  /** The fogged glass walls, for areas set in a greenhouse. */
  readonly greenhouses: readonly HTMLElement[];
}

/** The whole garden, laid out as one long walk from left to right. */
export function renderGarden(content: GardenContent): GardenScene {
  const { areas } = content;
  const places = [
    renderHive(content.welcome, areas[0]?.id),
    ...areas.map((area, i) => renderArea(area, areas[i + 1])),
  ];
  const viewport = h(
    "main",
    { class: "world" },
    h(
      "div",
      { class: "world__track" },
      ...places,
      h(
        "footer",
        { class: "world__end" },
        h("p", { class: "hanging-sign" }, content.footer),
      ),
    ),
  );
  const scene = h(
    "div",
    { class: "scene" },
    renderBackdrop(),
    viewport,
    renderFrontGrass(),
    h(
      "p",
      { class: "night-hint", "aria-hidden": "true" },
      "shh… the flowers are sleeping",
    ),
  );

  // Collected once here, so the rest of the app never has to search the DOM for them.
  const plots = new Map(
    [...viewport.querySelectorAll<HTMLElement>(PLOT_SELECTOR)].map(
      (plot) => [plot.getAttribute(PROJECT_ID_ATTRIBUTE) ?? "", plot] as const,
    ),
  );
  const greenhouses = [
    ...viewport.querySelectorAll<HTMLElement>(GREENHOUSE_SELECTOR),
  ];
  return { scene, viewport, places, plots, greenhouses };
}

/**
 * The place under horizontal position `x` (in the track's coordinates):
 * the last one that starts at or before it, or the first if `x` is before them all.
 * `places` must be in walking order.
 */
export function placeAt<T extends { readonly offsetLeft: number }>(
  places: readonly T[],
  x: number,
): T | undefined {
  return places.filter((place) => place.offsetLeft <= x).at(-1) ?? places[0];
}

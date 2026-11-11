import { h } from "../dom/create";
import type { GardenContent } from "../domain/types";
import { renderArea } from "./area";
import { renderHive } from "./hive";
import { renderBackdrop, renderFrontGrass } from "./scenery";

export interface GardenScene {
  /** Everything the camera zooms: backdrop, world, front grass. */
  readonly scene: HTMLElement;
  /** The horizontal scroll container. */
  readonly viewport: HTMLElement;
  /** The hive, then one section per area, left to right. */
  readonly places: readonly HTMLElement[];
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
  return { scene, viewport, places };
}

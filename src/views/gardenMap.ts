import { h } from "../dom/create";
import type { Area } from "../domain/types";
import { HIVE_ID } from "./ids";
import { goTo } from "./navigation";

export interface GardenMap {
  readonly element: HTMLElement;
  /** Highlights where the visitor is. */
  setCurrent(id: string): void;
}

interface Stop {
  readonly id: string;
  readonly label: string;
  readonly setting: string;
}

/** The little map at the bottom: one stop per area, the current one highlighted. */
export function renderGardenMap(areas: readonly Area[]): GardenMap {
  const stops: Stop[] = [
    { id: HIVE_ID, label: "Hive", setting: "hive" },
    ...areas.map((area) => ({
      id: area.id,
      label: area.title,
      setting: area.setting,
    })),
  ];
  const buttons = stops.map((stop) =>
    h(
      "button",
      {
        type: "button",
        class: `garden-map__stop garden-map__stop--${stop.setting}`,
        ...goTo(stop.id),
      },
      h("span", { class: "garden-map__dot", "aria-hidden": "true" }),
      h("span", { class: "garden-map__label" }, stop.label),
    ),
  );

  const items = buttons.flatMap((button, i) => [
    i > 0
      ? h("li", { class: "garden-map__path", "aria-hidden": "true" })
      : null,
    h("li", {}, button),
  ]);

  return {
    element: h(
      "nav",
      { class: "garden-map", "aria-label": "Garden map" },
      h("ol", {}, ...items),
    ),
    setCurrent(id) {
      stops.forEach((stop, i) => {
        if (stop.id === id)
          buttons[i]?.setAttribute("aria-current", "location");
        else buttons[i]?.removeAttribute("aria-current");
      });
    },
  };
}

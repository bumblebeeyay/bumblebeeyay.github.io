import { h, svg } from "../dom/create";
import type { WelcomeContent } from "../domain/types";
import { arrowRightIcon } from "./icons";
import { HIVE_ID, WELCOME_TITLE_ID } from "./ids";
import { goTo } from "./navigation";

/** A straw skep on its wooden stool. */
function renderSkep(): SVGSVGElement {
  const rings = [
    [684, 112, 20],
    [656, 108, 20],
    [628, 100, 20],
    [600, 88, 19],
    [574, 72, 18],
    [550, 52, 16],
    [530, 28, 12],
  ] as const;
  return svg(
    "svg",
    { class: "skep", viewBox: "170 510 240 280", "aria-hidden": "true" },
    svg(
      "g",
      { class: "skep__stool" },
      svg("rect", { x: 190, y: 700, width: 200, height: 16, rx: 4 }),
      svg("rect", { x: 208, y: 714, width: 14, height: 76 }),
      svg("rect", { x: 358, y: 714, width: 14, height: 76 }),
    ),
    svg(
      "g",
      { class: "skep__straw" },
      ...rings.map(([cy, rx, ry]) => svg("ellipse", { cx: 290, cy, rx, ry })),
    ),
    svg("path", { class: "skep__door", d: "M266 700a24 26 0 0 1 48 0Z" }),
  );
}

/** The dotted line the bee drew flying out of the hive. */
function renderFlightTrail(): SVGSVGElement {
  return svg(
    "svg",
    {
      class: "hive__trail",
      viewBox: "0 0 600 400",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    },
    svg("path", { d: "M20 390C90 300 160 260 260 220S460 120 580 20" }),
  );
}

/** The start of the walk: the hive and the welcome. */
export function renderHive(
  welcome: WelcomeContent,
  firstAreaId: string | undefined,
): HTMLElement {
  return h(
    "section",
    { class: "hive", id: HIVE_ID, "aria-labelledby": WELCOME_TITLE_ID },
    renderFlightTrail(),
    renderSkep(),
    h(
      "div",
      { class: "hive__welcome" },
      h("p", { class: "hive__kicker" }, welcome.kicker),
      h("h1", { class: "hive__title", id: WELCOME_TITLE_ID }, welcome.title),
      h("p", { class: "hive__subtitle" }, welcome.subtitle),
      firstAreaId !== undefined &&
        h(
          "button",
          { type: "button", class: "honey-button", ...goTo(firstAreaId) },
          welcome.cta,
          arrowRightIcon(),
        ),
      h("p", { class: "hive__hint" }, welcome.hint),
    ),
  );
}

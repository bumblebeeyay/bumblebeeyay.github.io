import { h, svg } from "../dom/create";
import { listIcon, moonIcon, sunIcon } from "./icons";
import { HIVE_ID, JAR_CLIP_ID } from "./ids";
import { goTo } from "./navigation";

const JAR_PATH =
  "M6 10h22v4c3 2 4 5 4 9v9c0 4-3 6-7 6H9c-4 0-7-2-7-6v-9c0-4 1-7 4-9z";
/** Where the honey starts: the inside bottom of the jar, in its viewBox. */
const JAR_BOTTOM = 38;
/** How high the honey can rise: from the bottom (y = 38) to the neck (y = 12). */
const JAR_DEPTH = 26;

export interface Topbar {
  readonly element: HTMLElement;
  readonly listButton: HTMLButtonElement;
  readonly nightButton: HTMLButtonElement;
  /** Fills the honey jar. */
  setVisited(count: number, total: number): void;
  /** Shows the right label on the day/night switch. */
  setNight(night: boolean): void;
}

export function renderTopbar(brand: string): Topbar {
  const honey = svg("rect", {
    class: "honey-jar__honey",
    x: 0,
    y: JAR_BOTTOM,
    width: 34,
    height: 0,
  });
  const jar = svg(
    "svg",
    {
      class: "honey-jar",
      width: 26,
      height: 31,
      viewBox: "0 0 34 40",
      "aria-hidden": "true",
    },
    svg(
      "defs",
      {},
      svg("clipPath", { id: JAR_CLIP_ID }, svg("path", { d: JAR_PATH })),
    ),
    svg("path", { class: "honey-jar__glass", d: JAR_PATH }),
    svg("g", { "clip-path": `url(#${JAR_CLIP_ID})` }, honey),
    svg("path", { class: "honey-jar__outline", d: JAR_PATH }),
    svg("rect", {
      class: "honey-jar__lid",
      x: 4,
      y: 3,
      width: 26,
      height: 7,
      rx: 2,
    }),
  );
  const count = h("span", {});
  const countLabel = h("span", { class: "pill__label" }, " flowers visited");

  const listButton = h(
    "button",
    { type: "button", class: "pill", "aria-haspopup": "dialog" },
    listIcon(),
    h("span", { class: "pill__label" }, "List view"),
  );
  const nightLabel = h("span", { class: "pill__label" });
  const nightIcon = h("span", { class: "pill__icon" });
  const nightButton = h(
    "button",
    { type: "button", class: "pill" },
    nightIcon,
    nightLabel,
  );

  const element = h(
    "header",
    { class: "topbar" },
    h(
      "button",
      {
        type: "button",
        class: "topbar__brand",
        ...goTo(HIVE_ID),
      },
      brand,
    ),
    h(
      "nav",
      { class: "topbar__tools", "aria-label": "Tools" },
      listButton,
      nightButton,
      h(
        "p",
        { class: "pill pill--static", role: "status" },
        jar,
        count,
        countLabel,
      ),
    ),
  );

  return {
    element,
    listButton,
    nightButton,
    setVisited(visited, total) {
      count.textContent = `${visited} / ${total}`;
      const level = total === 0 ? 0 : (visited / total) * JAR_DEPTH;
      honey.setAttribute("y", String(JAR_BOTTOM - level));
      honey.setAttribute("height", String(level));
    },
    setNight(night) {
      // The button says where it takes you, and its name says the switch's state.
      nightLabel.textContent = night ? "Day" : "Night";
      nightIcon.replaceChildren(night ? sunIcon() : moonIcon());
      nightButton.setAttribute(
        "aria-label",
        night ? "Switch to day" : "Switch to night",
      );
    },
  };
}

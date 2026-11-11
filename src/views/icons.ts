import { svg } from "../dom/create";

/** Stroke icons drawn in `currentColor`, always decorative (the control carries the label). */
function icon(paths: readonly string[], size = 20): SVGSVGElement {
  return svg(
    "svg",
    {
      class: "icon",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2.4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    ...paths.map((d) => svg("path", { d })),
  );
}

export const moonIcon = () =>
  icon(["M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"], 18);

export const sunIcon = () =>
  icon(
    [
      "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z",
      "M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8",
    ],
    18,
  );

export const listIcon = () =>
  icon(["M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"], 18);
export const closeIcon = () => icon(["M6 6l12 12M18 6L6 18"], 18);
export const arrowRightIcon = () => icon(["M5 12h14M13 6l6 6-6 6"], 22);
export const chevronLeftIcon = () => icon(["M15 5l-7 7 7 7"], 22);
export const chevronRightIcon = () => icon(["M9 5l7 7-7 7"], 22);
export const lockIcon = () =>
  icon(["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"], 15);

/** Little four-point stars around a visited flower. */
export function sparkle(className: string): SVGSVGElement {
  return svg(
    "svg",
    { class: className, viewBox: "-10 -10 20 20", "aria-hidden": "true" },
    svg("path", { d: "M0-9l2.4 6.6L9 0l-6.6 2.4L0 9l-2.4-6.6L-9 0l6.6-2.4z" }),
  );
}

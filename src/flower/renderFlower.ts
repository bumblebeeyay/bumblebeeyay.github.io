import { svg } from "../dom/create";
import type { FlowerSpec } from "../domain/types";
import { PETAL_SHAPES, petalAngles } from "./petalShapes";

/** The flower is drawn in a 110 × 190 box; its head is centered here. */
const HEAD = { x: 55, y: 60 } as const;

const BLOOMED_CLASS = "is-bloomed";
export const FLOWER_SELECTOR = ".flower";
export const FLOWER_HEAD_SELECTOR = ".flower__anchor";

function renderStem(): SVGGElement {
  return svg(
    "g",
    { class: "flower__stem" },
    svg("path", {
      d: `M55 190C50 150 62 110 ${HEAD.x} ${HEAD.y + 10}`,
      class: "flower__stalk",
    }),
    svg("path", {
      d: "M55 150C38 146 26 132 22 116C40 116 52 128 55 150Z",
      class: "flower__leaf",
    }),
    svg("path", {
      d: "M56 124C72 118 82 104 86 90C70 92 58 104 56 124Z",
      class: "flower__leaf",
    }),
  );
}

/** The closed bud, centered on the head so buds and blooms line up. */
function renderBud(): SVGGElement {
  return svg(
    "g",
    { class: "flower__bud" },
    svg("path", {
      d: "M0 16C-12 8-12-10 0-20C12-10 12 8 0 16Z",
      class: "flower__bud-petal",
    }),
    svg("path", {
      d: "M0 19C-13 13-14 2-7-3L0 8L7-3C14 2 13 13 0 19Z",
      class: "flower__sepal",
    }),
  );
}

function renderHead(spec: FlowerSpec): SVGGElement {
  const shape = PETAL_SHAPES[spec.shape];
  const petals = petalAngles(shape).map((angle, index) =>
    svg(
      "g",
      { transform: `rotate(${angle})` },
      svg("path", {
        d: shape.path,
        class: "flower__petal",
        style: `--petal-index: ${index}`,
      }),
    ),
  );

  return svg(
    "g",
    { class: "flower__head", transform: `translate(${HEAD.x} ${HEAD.y})` },
    renderBud(),
    ...petals,
    shape.coreRadius > 0 &&
      svg("circle", { r: shape.coreRadius, class: "flower__core" }),
    svg("circle", { r: 1, class: "flower__anchor" }),
  );
}

/** Draws a flower, closed. Colors come from CSS custom properties. */
export function renderFlower(spec: FlowerSpec): SVGSVGElement {
  return svg(
    "svg",
    {
      class: "flower",
      viewBox: "0 0 110 190",
      "aria-hidden": "true",
      style: `--petal: ${spec.petal}; --outline: ${spec.outline}; --core: ${spec.core}`,
    },
    renderStem(),
    renderHead(spec),
  );
}

/** Opens or closes a flower. Hover blooms are handled in CSS; this is for clicks and touch. */
export function setBloomed(flower: Element, bloomed: boolean): void {
  flower.classList.toggle(BLOOMED_CLASS, bloomed);
}

import { seededRandom } from "../core/random";
import { h } from "../dom/create";

/** Width of one tile of front grass; it repeats seamlessly. */
const GRASS_TILE = { width: 1440, height: 200 } as const;

/**
 * A strip of grass blades as an SVG path. Starts and ends at the same height,
 * so tiles join without a seam.
 */
export function grassBladesPath(
  seed: number,
  { tall, base }: { tall: number; base: number },
): string {
  const random = seededRandom(seed);
  const { width, height } = GRASS_TILE;
  const parts = [`M0 ${height}V${base}`];
  let x = 0;
  while (x < width) {
    const bladeWidth = 14 + random() * 14;
    const end = Math.min(width, x + bladeWidth);
    const tipX = x + (end - x) * (0.3 + random() * 0.4);
    const tipY = base - tall * (0.35 + random() * 0.65);
    parts.push(
      `L${tipX.toFixed(1)} ${tipY.toFixed(1)}L${end.toFixed(1)} ${base}`,
    );
    x = end - bladeWidth * 0.25 * random();
    if (end >= width) break;
  }
  parts.push(`V${height}Z`);
  return parts.join("");
}

function svgMask(path: string): string {
  const { width, height } = GRASS_TILE;
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="${path}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
}

function layer(className: string, mask?: string): HTMLElement {
  return h("div", {
    class: `layer ${className}`,
    "aria-hidden": "true",
    style: mask ? `--mask: ${mask}` : undefined,
  });
}

/** Everything behind the world: sky, sun or moon, stars, clouds and three rows of hills. */
export function renderBackdrop(): HTMLElement {
  return h(
    "div",
    { class: "backdrop", "aria-hidden": "true" },
    layer("layer--stars"),
    h("div", { class: "sky-light" }),
    layer("layer--clouds"),
    layer("layer--hills-far"),
    layer("layer--hills-mid"),
    layer("layer--hills-near"),
    layer("layer--fireflies"),
  );
}

/** The grass closest to the visitor, in front of the plants. It moves faster than the world. */
export function renderFrontGrass(): HTMLElement {
  return h(
    "div",
    { class: "front-grass", "aria-hidden": "true" },
    layer(
      "layer--grass-back",
      svgMask(grassBladesPath(3, { tall: 70, base: 120 })),
    ),
    layer(
      "layer--grass-front",
      svgMask(grassBladesPath(11, { tall: 60, base: 150 })),
    ),
  );
}

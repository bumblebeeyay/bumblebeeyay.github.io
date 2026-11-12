import type { PetalShapeId } from "../domain/types";

/** How petals are spread around the flower's center, in degrees (0 = straight up). */
export type PetalArc =
  | { readonly kind: "ring" }
  | { readonly kind: "fan"; readonly from: number; readonly to: number };

export interface PetalShape {
  /** One petal, drawn pointing up, with its base at (0, 0). */
  readonly path: string;
  readonly count: number;
  readonly arc: PetalArc;
  /** Radius of the flower's heart. 0 means no visible heart. */
  readonly coreRadius: number;
}

/**
 * Every flower shape. To add a new one: add its id to `PETAL_SHAPE_IDS`,
 * then describe it here. Nothing else needs to change.
 */
export const PETAL_SHAPES = {
  daisy: {
    path: "M0 0C-13-6-13-30 0-32C13-30 13-6 0 0Z",
    count: 6,
    arc: { kind: "ring" },
    coreRadius: 10,
  },
  cosmos: {
    path: "M0 0C-10-8-12-30-6-38L0-33L6-38C12-30 10-8 0 0Z",
    count: 8,
    arc: { kind: "ring" },
    coreRadius: 9,
  },
  lotus: {
    path: "M0 0C-12-12-9-34 0-44C9-34 12-12 0 0Z",
    count: 7,
    arc: { kind: "fan", from: -78, to: 78 },
    coreRadius: 7,
  },
  tulip: {
    path: "M0 0C-15-6-16-30-6-40Q0-32 6-40C16-30 15-6 0 0Z",
    count: 3,
    arc: { kind: "fan", from: -28, to: 28 },
    coreRadius: 0,
  },
} as const satisfies Record<PetalShapeId, PetalShape>;

/** The rotation of each petal, in degrees. */
export function petalAngles({
  count,
  arc,
}: Pick<PetalShape, "count" | "arc">): number[] {
  if (count <= 0) return [];

  if (arc.kind === "ring") {
    return Array.from({ length: count }, (_, i) => (i * 360) / count);
  }

  if (count === 1) return [(arc.from + arc.to) / 2];

  const step = (arc.to - arc.from) / (count - 1);
  return Array.from({ length: count }, (_, i) => arc.from + i * step);
}

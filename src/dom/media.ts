export const prefersReducedMotion = (): boolean =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

/** False on touch screens, where nothing can be hovered. */
export const canHover = (): boolean => matchMedia("(hover: hover)").matches;

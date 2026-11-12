/**
 * Resolves when `element` finishes a CSS transition of its own,
 * or after `timeoutMs` (transitions can be skipped, e.g. with reduced motion).
 */
export function waitForTransition(
  element: Element,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      element.removeEventListener("transitionend", onEnd);
      resolve();
    };
    const onEnd = (event: Event): void => {
      if (event.target === element) done();
    };
    const timer = setTimeout(done, timeoutMs);
    element.addEventListener("transitionend", onEnd);
  });
}

/** Waits for the browser to paint once, so a class added next will animate. */
export const nextPaint = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

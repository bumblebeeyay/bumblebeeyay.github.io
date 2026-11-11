import { FLOWER_SELECTOR, setBloomed } from "../flower/renderFlower";

/**
 * Touch screens cannot hover, so flowers there bloom once they are well in view.
 * Returns a function that stops watching.
 */
export function bloomOnView(plots: Iterable<Element>): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const flower = entry.target.querySelector(FLOWER_SELECTOR);
        if (flower) setBloomed(flower, true);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.7 },
  );
  for (const plot of plots) observer.observe(plot);
  return () => observer.disconnect();
}

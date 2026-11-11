import { Controller } from "../dom/Controller";
import { FLOWER_SELECTOR, setBloomed } from "../flower/renderFlower";

/** How much of a plot must be on screen before its flower opens. */
const VISIBLE_SHARE = 0.7;

/** Touch screens cannot hover, so flowers there bloom once they are well in view. */
export class BloomOnView extends Controller {
  constructor(private readonly plots: Iterable<Element>) {
    super();
  }

  protected connect(signal: AbortSignal): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const flower = entry.target.querySelector(FLOWER_SELECTOR);
          if (flower) setBloomed(flower, true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: VISIBLE_SHARE },
    );
    for (const plot of this.plots) observer.observe(plot);
    signal.addEventListener("abort", () => observer.disconnect());
  }
}

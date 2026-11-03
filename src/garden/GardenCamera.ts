const ZOOMED_CLASS = 'is-zoomed';
const SCROLL_LOCK_CLASS = 'is-scroll-locked';

/** Zooms the whole garden toward one element, like a camera, and back. */
export class GardenCamera {
  constructor(
    private readonly world: HTMLElement,
    private readonly zoom = 2.4,
  ) {}

  focusOn(target: Element): void {
    const t = target.getBoundingClientRect();
    const w = this.world.getBoundingClientRect();
    // Origin slightly right of and above the plot center: the flower, not the label.
    const originX = t.left + t.width * 0.7 - w.left;
    const originY = t.top + t.height * 0.3 - w.top;

    this.world.style.transformOrigin = `${originX}px ${originY}px`;
    this.world.style.transform = `scale(${this.zoom})`;
    this.world.classList.add(ZOOMED_CLASS);
    this.world.inert = true;
    document.documentElement.classList.add(SCROLL_LOCK_CLASS);
  }

  reset(): void {
    this.world.style.transform = '';
    this.world.classList.remove(ZOOMED_CLASS);
    this.world.inert = false;
    document.documentElement.classList.remove(SCROLL_LOCK_CLASS);
  }
}

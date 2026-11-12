const READING_CLASS = "is-reading";

/**
 * Zooms the whole scene toward one element, like a camera, and back.
 * While zoomed, the scene and the page's controls are inert, so focus stays on the project.
 */
export class GardenCamera {
  constructor(
    private readonly scene: HTMLElement,
    private readonly controls: readonly HTMLElement[],
    private readonly zoom = 1.9,
  ) {}

  focusOn(target: Element): void {
    const t = target.getBoundingClientRect();
    const s = this.scene.getBoundingClientRect();
    // Aim at the flower, a bit right of and above the plot's center (the label is on the left).
    const originX = t.left + t.width * 0.7 - s.left;
    const originY = t.top + t.height * 0.3 - s.top;

    this.scene.style.transformOrigin = `${originX}px ${originY}px`;
    this.scene.style.transform = `scale(${this.zoom})`;
    this.#setReading(true);
  }

  reset(): void {
    this.scene.style.transform = "";
    this.#setReading(false);
  }

  #setReading(reading: boolean): void {
    document.documentElement.classList.toggle(READING_CLASS, reading);
    for (const element of [this.scene, ...this.controls])
      element.inert = reading;
  }
}

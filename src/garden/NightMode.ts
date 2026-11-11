type Listener = (night: boolean) => void;

/**
 * Day or night, shown as `data-theme` on the root element for the stylesheets.
 * Starts from the visitor's clock; the switch then wins for the rest of the visit.
 */
export class NightMode {
  #night: boolean;
  readonly #listeners: Listener[] = [];

  constructor(
    initiallyNight: boolean,
    private readonly root: HTMLElement = document.documentElement,
  ) {
    this.#night = initiallyNight;
    this.#apply();
  }

  get isNight(): boolean {
    return this.#night;
  }

  toggle(): void {
    this.#night = !this.#night;
    this.#apply();
  }

  /** Calls `listener` now and after every switch. */
  subscribe(listener: Listener): void {
    this.#listeners.push(listener);
    listener(this.#night);
  }

  #apply(): void {
    this.root.dataset.theme = this.#night ? "night" : "day";
    for (const listener of this.#listeners) listener(this.#night);
  }
}

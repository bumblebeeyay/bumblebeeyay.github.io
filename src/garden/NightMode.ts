import { Controller } from "../dom/Controller";
import { Store, type ReadonlyStore } from "../util/store";

/**
 * Tints the browser's own interface (the address bar on phones) with the sky.
 * The color is read from the current theme's `--sky-mid` token, so it is never written twice.
 */
export function syncThemeColor(doc: Document = document): void {
  const meta = doc.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const sky = getComputedStyle(doc.documentElement)
    .getPropertyValue("--sky-mid")
    .trim();
  if (meta && sky) meta.content = sky;
}

/**
 * Day or night, shown as `data-theme` on the root element for the stylesheets,
 * and as the browser's theme color.
 * Starts from the visitor's clock; the switch then wins for the rest of the visit.
 */
export class NightMode extends Controller {
  readonly #night: Store<boolean>;
  /** True at night. Follow it to redraw anything that changes with the theme. */
  readonly night: ReadonlyStore<boolean>;

  constructor(
    initiallyNight: boolean,
    private readonly root: HTMLElement = document.documentElement,
  ) {
    super();
    this.#night = new Store(initiallyNight);
    this.night = this.#night;
  }

  toggle(): void {
    this.#night.set(!this.#night.value);
  }

  protected connect(signal: AbortSignal): void {
    this.#night.subscribe(
      (night) => {
        this.root.dataset.theme = night ? "night" : "day";
        // After the theme changed, so the new sky color is the one read.
        syncThemeColor(this.root.ownerDocument);
      },
      { signal },
    );
  }
}

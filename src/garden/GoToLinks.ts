import { Controller } from "../dom/Controller";
import { goToPlaceId } from "../views/navigation";
import type { WorldScroller } from "../input/WorldScroller";

/**
 * Makes every go-to control (signposts, the map, the brand, the hive's button) walk
 * the garden to its place. One delegated listener covers controls inside and outside
 * the scene. `canMove` lets the caller freeze the walk, e.g. while a project is open.
 */
export class GoToLinks extends Controller {
  constructor(
    private readonly doc: Document,
    private readonly scroller: Pick<WorldScroller, "scrollToElement">,
    private readonly canMove: () => boolean,
  ) {
    super();
  }

  protected connect(signal: AbortSignal): void {
    this.doc.addEventListener("click", this.#handleClick, { signal });
  }

  readonly #handleClick = (event: Event): void => {
    const id = goToPlaceId(event.target);
    if (id === null || !this.canMove()) return;
    const place = this.doc.getElementById(id);
    if (place) this.scroller.scrollToElement(place);
  };
}

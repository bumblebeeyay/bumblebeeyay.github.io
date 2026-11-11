import { goToPlaceId } from "../views/navigation";
import type { WorldScroller } from "../world/WorldScroller";

/**
 * Makes every go-to control (signposts, the map, the brand, the hive's button) walk
 * the garden to its place. One delegated listener covers controls inside and outside
 * the scene. `canMove` lets the caller freeze the walk, e.g. while a project is open.
 * Returns a function that stops listening.
 */
export function followGoToLinks(
  doc: Document,
  scroller: Pick<WorldScroller, "scrollToElement">,
  canMove: () => boolean,
): () => void {
  const handleClick = (event: Event): void => {
    const id = goToPlaceId(event.target);
    if (id === null || !canMove()) return;
    const place = doc.getElementById(id);
    if (place) scroller.scrollToElement(place);
  };
  doc.addEventListener("click", handleClick);
  return () => doc.removeEventListener("click", handleClick);
}

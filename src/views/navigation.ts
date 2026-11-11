/**
 * Marks a control that leads somewhere in the garden (signposts, the map, the brand,
 * the hive's button). Its value is the element id of the place: the hive or an area.
 */
export const GO_TO_ATTRIBUTE = "data-go-to";

/** Attributes that turn a button into a way to `placeId`. */
export const goTo = (placeId: string): Record<string, string> => ({
  [GO_TO_ATTRIBUTE]: placeId,
});

/** The place a click asks to go to, or null if it did not hit a go-to control. */
export function goToPlaceId(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  return (
    target.closest(`[${GO_TO_ATTRIBUTE}]`)?.getAttribute(GO_TO_ATTRIBUTE) ??
    null
  );
}

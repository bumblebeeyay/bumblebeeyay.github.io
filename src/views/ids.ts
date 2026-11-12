/**
 * Every element id the page sets, in one place, so none can be taken twice.
 *
 * Content ids are slugs, which never contain "--" (see `domain/parseGarden.ts`).
 * Ids derived from content therefore use "--" and can never clash with a content id.
 * The fixed ids below are slug-shaped, so they are passed to the parser as reserved.
 */

/** The hive section; also a place the map and the brand lead to. */
export const HIVE_ID = "hive";
export const WELCOME_TITLE_ID = "welcome-title";
export const SHEET_TITLE_ID = "herbarium-title";
export const LIST_TITLE_ID = "list-title";
/** The honey jar's clip path. */
export const JAR_CLIP_ID = "jar-inside";

/** Fixed ids that no area or project may use. */
export const PAGE_IDS: readonly string[] = [
  HIVE_ID,
  WELCOME_TITLE_ID,
  SHEET_TITLE_ID,
  LIST_TITLE_ID,
  JAR_CLIP_ID,
];

/** The heading on an area's signpost. */
export const areaTitleId = (areaId: string): string => `${areaId}--title`;

/** An area's heading in the list view. */
export const listAreaTitleId = (areaId: string): string => `list--${areaId}`;

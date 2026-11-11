import { vec2, type Vec2 } from "../core/vec2";

/** Center of an element, in viewport coordinates. */
export function viewportCenter(element: Element): Vec2 {
  const { left, top, width, height } = element.getBoundingClientRect();
  return vec2(left + width / 2, top + height / 2);
}

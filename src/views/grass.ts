import { h } from '../dom/create';

/**
 * A clump of grass, to hide where posts, stakes and stems go into the ground.
 * Place it with a modifier class from the parent's stylesheet.
 */
export function grassClump(...classNames: string[]): HTMLSpanElement {
  return h('span', { class: ['grass', ...classNames].join(' '), 'aria-hidden': 'true' });
}

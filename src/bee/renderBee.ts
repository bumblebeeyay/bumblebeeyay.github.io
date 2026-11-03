import { h, svg } from '../dom/create';

/** Draws the bee, facing right. It never catches clicks. */
export function renderBee(): HTMLElement {
  return h(
    'div',
    { class: 'bee', 'aria-hidden': 'true' },
    svg(
      'svg',
      { viewBox: '0 0 64 56', width: 52, height: 46 },
      svg(
        'g',
        { class: 'bee__wings' },
        svg('ellipse', { class: 'bee__wing', cx: 26, cy: 14, rx: 9, ry: 13 }),
        svg('ellipse', { class: 'bee__wing bee__wing--back', cx: 36, cy: 13, rx: 8, ry: 12 }),
      ),
      svg('path', { class: 'bee__ink', d: 'M8 34L1 36L8 38Z' }),
      svg('ellipse', { class: 'bee__body', cx: 30, cy: 35, rx: 22, ry: 15 }),
      svg('path', { class: 'bee__stripe', d: 'M22 21.5Q19 35 22 48.5' }),
      svg('path', { class: 'bee__stripe', d: 'M33 20.5Q30 35 33 49.5' }),
      svg('circle', { class: 'bee__ink', cx: 48, cy: 31, r: 2.8 }),
      svg('circle', { class: 'bee__cheek', cx: 49, cy: 39, r: 2.6 }),
      svg('path', { class: 'bee__antennae', d: 'M46 21Q49 12 54 11M50 23Q55 16 59 17' }),
    ),
  );
}

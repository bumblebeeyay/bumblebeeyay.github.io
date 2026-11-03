import { h } from '../dom/create';
import type { GardenContent } from '../domain/types';
import { renderArea } from './area';
import { renderPlot } from './plot';
import { renderWelcome } from './welcome';

/** The whole scrollable garden: welcome sign, fenced areas, footer. */
export function renderGarden(content: GardenContent): HTMLElement {
  return h(
    'main',
    { class: 'garden' },
    renderWelcome(content.welcome),
    ...content.areas.map((area) => renderArea(area, renderPlot)),
    h('footer', { class: 'garden__footer' }, content.footer),
  );
}

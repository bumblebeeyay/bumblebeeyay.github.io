import { h } from '../dom/create';
import type { Project } from '../domain/types';
import { renderFlower } from '../flower/renderFlower';
import { grassClump } from './grass';

/** Attribute linking a plot in the DOM to its project. */
export const PROJECT_ID_ATTRIBUTE = 'data-project-id';

/** A small engraved label on a stake, like the ones naming plants in botanical gardens. */
function renderPlantLabel(project: Project): HTMLSpanElement {
  return h('span',
    { class: 'plant-label' },
    h('span',
      { class: 'plant-label__plate' },
      h('span', { class: 'plant-label__title' }, project.title),
      h('span', { class: 'plant-label__line' }, project.summary),
    ),
    h('span', { class: 'plant-label__stake' }),
  );
}

/** One project in the garden: its label and its flower. The whole plot is one button. */
export function renderPlot(project: Project): HTMLButtonElement {
  return h(
    'button',
    {
      type: 'button',
      class: 'plot',
      [PROJECT_ID_ATTRIBUTE]: project.id,
      'aria-haspopup': 'dialog',
      'aria-label': `${project.title}: open details`,
    },
    renderPlantLabel(project),
    renderFlower(project.flower),
    grassClump('plot__grass'),
  );
}

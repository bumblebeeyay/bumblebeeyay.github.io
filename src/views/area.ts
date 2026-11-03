import { h } from '../dom/create';
import type { Area, Project } from '../domain/types';

export type PlotRenderer = (project: Project) => HTMLElement;

/** A fenced part of the garden, with its sign and its plots. */
export function renderArea(area: Area, renderPlot: PlotRenderer): HTMLElement {
  const titleId = `${area.id}-title`;
  return h('section',
    { class: 'area', id: area.id, 'aria-labelledby': titleId },
    h('div',
      { class: 'fence' },
      h('div',
        { class: 'fence-sign' },
        h('h2', { class: 'fence-sign__title', id: titleId }, area.title),
      ),
    ),
    h('div', { class: 'area__plots' }, ...area.projects.map(renderPlot)),
  );
}

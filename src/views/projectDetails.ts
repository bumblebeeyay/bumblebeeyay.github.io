import { h } from '../dom/create';
import type { Project, ProjectLink } from '../domain/types';

export const DETAILS_TITLE_ID = 'project-details-title';

function renderLink(link: ProjectLink): HTMLElement {
  return link.href === undefined
    ? h('span', { class: 'project-details__tag' }, link.label)
    : h('a',
        { class: 'project-details__link', href: link.href, target: '_blank', rel: 'noopener noreferrer' },
        link.label,
      );
}

/** What the big sign says about a project. */
export function renderProjectDetails(project: Project): HTMLElement {
  return h('div',
    { class: 'project-details' },
    h('h2', { class: 'project-details__title', id: DETAILS_TITLE_ID }, project.title),
    h('p', { class: 'project-details__description' }, project.description),
    project.links.length > 0 &&
      h('div', { class: 'project-details__links' }, ...project.links.map(renderLink)),
  );
}

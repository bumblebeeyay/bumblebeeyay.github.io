import { h } from '../dom/create';
import type { WelcomeContent } from '../domain/types';
import { grassClump } from './grass';

/** The big wooden "Welcome" sign at the top of the garden. */
export function renderWelcome(welcome: WelcomeContent): HTMLElement {
  return h('section', { class: 'welcome', id: 'welcome', 'aria-labelledby': 'welcome-title' },
    h('div', { class: 'welcome-sign' },
      h('span', { class: 'wood-post welcome-sign__post welcome-sign__post--left' }),
      h('span', { class: 'wood-post welcome-sign__post welcome-sign__post--right' }),
      h('div', { class: 'wood-board welcome-sign__board' },
        h('p', { class: 'welcome-sign__kicker' }, welcome.kicker),
        h('h1', { class: 'welcome-sign__title', id: 'welcome-title' }, welcome.title),
        h('p', { class: 'welcome-sign__subtitle' }, welcome.subtitle),
      ),
      grassClump('welcome-sign__grass', 'welcome-sign__grass--left'),
      grassClump('welcome-sign__grass', 'welcome-sign__grass--right'),
    ),
    h('p', { class: 'welcome__hint' }, welcome.hint),
  );
}

import { h } from '../dom/create';
import { viewportCenter } from '../dom/geometry';
import { nextPaint, waitForTransition } from '../dom/transition';
import type { Vec2 } from '../core/vec2';
import type { PlantedProject } from '../domain/parseGarden';
import { FLOWER_HEAD_SELECTOR, renderFlower, setBloomed } from '../flower/renderFlower';
import { grassClump } from '../views/grass';
import { DETAILS_TITLE_ID, renderProjectDetails } from '../views/projectDetails';

const VISIBLE_CLASS = 'is-visible';
const CLOSE_ANIMATION_MS = 500;

/**
 * The close-up of one project: its flower in full bloom next to a big sign.
 * Uses a non-modal <dialog> so the bee can keep flying above it; the garden
 * behind is made inert by the camera, so focus cannot wander there.
 */
export class ProjectDialog {
  readonly element: HTMLDialogElement;
  readonly #flowerSlot: HTMLElement;
  readonly #detailsSlot: HTMLElement;
  readonly #closeButton: HTMLButtonElement;
  #onRequestClose: () => void = () => undefined;

  constructor() {
    this.#closeButton = h(
      'button',
      { type: 'button', class: 'project-dialog__close', 'aria-label': 'Back to the garden' },
      '×',
    );
    this.#flowerSlot = h('div', { class: 'project-dialog__flower-slot' });
    this.#detailsSlot = h('div', { class: 'wood-board big-sign__board' });

    this.element = h(
      'dialog',
      { class: 'project-dialog', 'aria-labelledby': DETAILS_TITLE_ID },
      this.#closeButton,
      h(
        'div',
        { class: 'project-dialog__stage' },
        h('div', { class: 'project-dialog__flower' }, this.#flowerSlot, grassClump('project-dialog__grass')),
        h(
          'article',
          { class: 'big-sign' },
          h('span', { class: 'wood-post big-sign__post big-sign__post--left' }),
          h('span', { class: 'wood-post big-sign__post big-sign__post--right' }),
          this.#detailsSlot,
          grassClump('big-sign__grass', 'big-sign__grass--left'),
          grassClump('big-sign__grass', 'big-sign__grass--right'),
        ),
      ),
    );

    this.#closeButton.addEventListener('click', () => this.#onRequestClose());
    this.element.addEventListener('click', this.#handleBackdropClick);
    document.addEventListener('keydown', this.#handleKeydown);
  }

  /** Called when the visitor asks to leave: × button, Escape, or a click beside the sign. */
  onRequestClose(handler: () => void): void {
    this.#onRequestClose = handler;
  }

  get isOpen(): boolean {
    return this.element.open;
  }

  /** Where the big flower's heart is on screen, or null when closed. */
  get flowerHeadPosition(): Vec2 | null {
    const head = this.isOpen ? this.#flowerSlot.querySelector(FLOWER_HEAD_SELECTOR) : null;
    return head ? viewportCenter(head) : null;
  }

  async open({ project }: PlantedProject): Promise<void> {
    const flower = renderFlower(project.flower);
    setBloomed(flower, true);
    this.#flowerSlot.replaceChildren(flower);
    this.#detailsSlot.replaceChildren(renderProjectDetails(project));

    this.element.show();
    this.#closeButton.focus({ preventScroll: true });
    await nextPaint();
    this.element.classList.add(VISIBLE_CLASS);
  }

  async close(): Promise<void> {
    if (!this.isOpen) return;
    this.element.classList.remove(VISIBLE_CLASS);
    await waitForTransition(this.element, CLOSE_ANIMATION_MS);
    this.element.close();
  }

  readonly #handleBackdropClick = (event: MouseEvent): void => {
    const target = event.target as Element;
    if (!target.closest('.big-sign, .project-dialog__flower, .project-dialog__close')) {
      this.#onRequestClose();
    }
  };

  readonly #handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen) this.#onRequestClose();
  };
}

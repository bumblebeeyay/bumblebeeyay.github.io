import { add, vec2 } from '../core/vec2';
import type { Bee } from '../bee/Bee';
import type { BeeBehaviour } from '../bee/behaviours';
import { viewportCenter } from '../dom/geometry';
import type { PlantedProject } from '../domain/parseGarden';
import { FLOWER_HEAD_SELECTOR, FLOWER_SELECTOR, setBloomed } from '../flower/renderFlower';
import { PROJECT_ID_ATTRIBUTE } from '../views/plot';
import type { GardenCamera } from './GardenCamera';
import type { ProjectDialog } from './ProjectDialog';

/** Where the bee lands, relative to a flower's heart. */
const LANDING_OFFSET = vec2(-14, -26);

export interface GardenAppDependencies {
  readonly world: HTMLElement;
  readonly projects: ReadonlyMap<string, PlantedProject>;
  readonly bee: Bee;
  readonly camera: GardenCamera;
  readonly dialog: ProjectDialog;
  /** How the bee flies while the visitor strolls. */
  readonly exploring: BeeBehaviour;
  /** How the bee flies while a project is open. */
  readonly reading: BeeBehaviour;
  readonly reducedMotion: boolean;
  readonly canHover: boolean;
}

type State =
  | { readonly phase: 'exploring' }
  | { readonly phase: 'visiting' | 'reading' | 'leaving'; readonly plot: HTMLElement };

/**
 * Coordinates one visit: click a plot → the flower blooms → the bee rushes over →
 * the camera zooms in → the project opens. And the way back.
 * Each step is delegated; this class only owns the order and the state.
 */
export class GardenApp {
  #state: State = { phase: 'exploring' };

  constructor(private readonly deps: GardenAppDependencies) {}

  start(): void {
    this.deps.world.addEventListener('click', this.#handleClick);
    this.deps.dialog.onRequestClose(() => void this.leave());
  }

  // Visit a flower
  async visit(plot: HTMLElement): Promise<void> {
    const entry = this.#projectOf(plot);
    if (this.#state.phase !== 'exploring' || !entry) return;
    this.#state = { phase: 'visiting', plot };

    const { bee, camera, dialog } = this.deps;
    this.#setPlotBloomed(plot, true);

    const head = plot.querySelector(FLOWER_HEAD_SELECTOR);
    if (head && !this.deps.reducedMotion) {
      await bee.flyTo(add(viewportCenter(head), LANDING_OFFSET));
    }

    camera.focusOn(plot);
    await dialog.open(entry);
    bee.setBehaviour(this.deps.reading);
    this.#state = { phase: 'reading', plot };
  }

  // Leave a flower
  async leave(): Promise<void> {
    if (this.#state.phase !== 'reading') return;
    const { plot } = this.#state;
    this.#state = { phase: 'leaving', plot };

    const { bee, camera, dialog } = this.deps;
    bee.setBehaviour(this.deps.exploring);
    camera.reset();
    await dialog.close();

    // On touch screens flowers stay open once seen; with a mouse, hover decides.
    if (this.deps.canHover) this.#setPlotBloomed(plot, false);
    plot.focus({ preventScroll: true });
    this.#state = { phase: 'exploring' };
  }

  readonly #handleClick = (event: MouseEvent): void => {
    const plot = (event.target as Element).closest<HTMLElement>(`[${PROJECT_ID_ATTRIBUTE}]`);
    if (plot) void this.visit(plot);
  };

  #projectOf(plot: HTMLElement): PlantedProject | undefined {
    const id = plot.getAttribute(PROJECT_ID_ATTRIBUTE);
    return id === null ? undefined : this.deps.projects.get(id);
  }

  #setPlotBloomed(plot: HTMLElement, bloomed: boolean): void {
    const flower = plot.querySelector(FLOWER_SELECTOR);
    if (flower) setBloomed(flower, bloomed);
  }
}

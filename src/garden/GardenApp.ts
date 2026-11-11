import { add, vec2 } from "../util/vec2";
import type { Bee } from "../bee/Bee";
import type { BeeBehaviour } from "../bee/behaviours";
import { viewportCenter } from "../dom/geometry";
import { nextPaint } from "../dom/transition";
import type { PlantedProject } from "../domain/garden";
import {
  FLOWER_HEAD_SELECTOR,
  FLOWER_SELECTOR,
  setBloomed,
} from "../flower/renderFlower";
import { PLOT_SELECTOR, PROJECT_ID_ATTRIBUTE } from "../views/plot";
import type { WorldScroller } from "../world/WorldScroller";
import type { GardenCamera } from "./GardenCamera";
import type { Direction, ProjectDialog } from "./ProjectDialog";
import type { VisitedProjects } from "./VisitedProjects";

/** Where the bee lands, relative to a flower's heart. */
const LANDING_OFFSET = vec2(-14, -26);

export interface GardenAppDependencies {
  readonly scroller: WorldScroller;
  /** In walking order, left to right. */
  readonly projects: ReadonlyMap<string, PlantedProject>;
  /** The plot of each project, by project id. */
  readonly plots: ReadonlyMap<string, HTMLElement>;
  readonly bee: Bee;
  readonly camera: GardenCamera;
  readonly dialog: ProjectDialog;
  readonly visited: VisitedProjects;
  /** How the bee flies while the visitor strolls. */
  readonly exploring: BeeBehaviour;
  /** How the bee flies while a project is open. */
  readonly reading: BeeBehaviour;
  readonly reducedMotion: boolean;
}

type State =
  | { readonly phase: "exploring" }
  | {
      readonly phase: "visiting" | "reading" | "leaving";
      readonly projectId: string;
    };

/**
 * Coordinates one visit: click a plot → the flower blooms → the bee rushes over →
 * the camera zooms in → the herbarium sheet opens. Then flipping through sheets, and the way back.
 * Each step is delegated; this class only owns the order and the state.
 */
export class GardenApp {
  #state: State = { phase: "exploring" };
  readonly #order: readonly string[];

  constructor(private readonly deps: GardenAppDependencies) {
    this.#order = [...deps.projects.keys()];
  }

  get isExploring(): boolean {
    return this.#state.phase === "exploring";
  }

  start(): void {
    this.deps.scroller.viewport.addEventListener(
      "click",
      this.#handlePlotClick,
    );
    this.deps.dialog.onRequestClose(() => void this.leave());
    this.deps.dialog.onNavigate((direction) => this.step(direction));
  }

  async visit(plot: HTMLElement): Promise<void> {
    const entry = this.#projectOf(plot);
    if (this.#state.phase !== "exploring" || !entry) return;
    this.#state = { phase: "visiting", projectId: entry.project.id };

    const { bee, camera, dialog, scroller, visited } = this.deps;
    scroller.enabled = false;
    this.#bloom(plot);

    const head = plot.querySelector(FLOWER_HEAD_SELECTOR);
    if (head && !this.deps.reducedMotion) {
      await bee.flyTo(add(viewportCenter(head), LANDING_OFFSET));
    }

    camera.focusOn(plot);
    await dialog.open(entry);
    visited.add(entry.project.id);
    bee.setBehaviour(this.deps.reading);
    this.#state = { phase: "reading", projectId: entry.project.id };
  }

  /** Opens a project from outside the garden (the list view): walk to it first. */
  async visitById(projectId: string): Promise<void> {
    const plot = this.#plotOf(projectId);
    if (!plot) return;
    this.deps.scroller.centerOn(plot, { instant: true });
    await nextPaint();
    await this.visit(plot);
  }

  /** Flips to the previous or next sheet, wrapping around the garden. */
  step(direction: Direction): void {
    if (this.#state.phase !== "reading") return;
    const { length } = this.#order;
    const index = this.#order.indexOf(this.#state.projectId);
    if (index === -1) return;
    // `+ length` keeps the index positive when stepping back from the first sheet.
    const id = this.#order[(index + direction + length) % length];
    const entry = id === undefined ? undefined : this.deps.projects.get(id);
    if (!entry) return;

    this.deps.dialog.show(entry);
    this.deps.visited.add(entry.project.id);
    this.#state = { phase: "reading", projectId: entry.project.id };
  }

  async leave(): Promise<void> {
    if (this.#state.phase !== "reading") return;
    const { projectId } = this.#state;
    this.#state = { phase: "leaving", projectId };

    const { bee, camera, dialog, scroller } = this.deps;
    bee.setBehaviour(this.deps.exploring);
    camera.reset();
    await dialog.close();

    // Come back where the last sheet's flower grows, which may not be where the visit began.
    const plot = this.#plotOf(projectId);
    if (plot) {
      this.#bloom(plot);
      scroller.centerOn(plot, { instant: true });
      plot.focus({ preventScroll: true });
    }
    scroller.enabled = true;
    this.#state = { phase: "exploring" };
  }

  readonly #handlePlotClick = (event: MouseEvent): void => {
    const plot = (event.target as Element).closest<HTMLElement>(PLOT_SELECTOR);
    if (plot) void this.visit(plot);
  };

  #projectOf(plot: HTMLElement): PlantedProject | undefined {
    const id = plot.getAttribute(PROJECT_ID_ATTRIBUTE);
    return id === null ? undefined : this.deps.projects.get(id);
  }

  #plotOf(projectId: string): HTMLElement | undefined {
    return this.deps.plots.get(projectId);
  }

  /** Visited flowers stay open, even after the pointer leaves them. */
  #bloom(plot: HTMLElement): void {
    const flower = plot.querySelector(FLOWER_SELECTOR);
    if (flower) setBloomed(flower, true);
  }
}

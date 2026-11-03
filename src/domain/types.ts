/** The shapes a flower can take. Add one here and in `flower/petalShapes.ts`. */
export const PETAL_SHAPE_IDS = ['daisy', 'cosmos', 'lotus', 'tulip'] as const;
export type PetalShapeId = (typeof PETAL_SHAPE_IDS)[number];

/** How a project's flower looks. Colors are CSS hex colors. */
export interface FlowerSpec {
  readonly shape: PetalShapeId;
  readonly petal: string;
  readonly outline: string;
  readonly core: string;
}

/** A link on a project's sign. Without `href`, it is shown as a plain note. */
export interface ProjectLink {
  readonly label: string;
  readonly href?: string;
}

export interface Project {
  /** Unique across the whole garden; used in the DOM to find the project. */
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly links: readonly ProjectLink[];
  readonly flower: FlowerSpec;
}

/** A fenced part of the garden. */
export interface Area {
  readonly id: string;
  readonly title: string;
  readonly projects: readonly Project[];
}

export interface WelcomeContent {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly hint: string;
}

export interface GardenContent {
  readonly welcome: WelcomeContent;
  readonly areas: readonly Area[];
  readonly footer: string;
}

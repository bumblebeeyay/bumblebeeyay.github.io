/** The shapes a flower can take. Add one here and in `flower/petalShapes.ts`. */
export const PETAL_SHAPE_IDS = ["daisy", "cosmos", "lotus", "tulip"] as const;
export type PetalShapeId = (typeof PETAL_SHAPE_IDS)[number];

/** How a part of the garden is drawn. */
export const SETTING_IDS = ["meadow", "greenhouse", "wild"] as const;
export type SettingId = (typeof SETTING_IDS)[number];

/** How a project's flower looks. Colors are CSS hex colors. */
export interface FlowerSpec {
  readonly shape: PetalShapeId;
  readonly petal: string;
  readonly outline: string;
  readonly core: string;
}

/** A link on a project's page. Without `href`, it is shown as a plain note. */
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
  /** Short words stamped on the project page, e.g. technologies. */
  readonly tags: readonly string[];
  readonly links: readonly ProjectLink[];
  readonly flower: FlowerSpec;
}

/** A part of the garden, visited left to right. */
export interface Area {
  readonly id: string;
  readonly title: string;
  /** The small line under the title on the area's signpost. */
  readonly tagline: string;
  readonly setting: SettingId;
  /** Optional words on a small hanging sign, e.g. "ask me for a demo!". */
  readonly note?: string;
  readonly projects: readonly Project[];
}

export interface WelcomeContent {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  /** Label of the button that flies into the first area. */
  readonly cta: string;
  readonly hint: string;
}

export interface GardenContent {
  /** Name shown top left. */
  readonly brand: string;
  readonly welcome: WelcomeContent;
  readonly areas: readonly Area[];
  readonly footer: string;
}

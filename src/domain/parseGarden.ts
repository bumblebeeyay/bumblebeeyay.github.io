import {
  PETAL_SHAPE_IDS,
  type Area,
  type FlowerSpec,
  type GardenContent,
  type Project,
  type ProjectLink,
  type WelcomeContent,
} from './types';

/** Thrown when garden.json does not match the expected shape. The message names the bad field. */
export class ContentError extends Error {
  constructor(path: string, problem: string) {
    super(`garden.json › ${path}: ${problem}`);
    this.name = 'ContentError';
  }
}

type Reader<T> = (value: unknown, path: string) => T;

/* ---------- primitive readers ---------- */

function readObject(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ContentError(path, 'expected an object');
  }
  return value as Record<string, unknown>;
}

function readText(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ContentError(path, 'expected a non-empty string');
  }
  return value;
}



function readList<T>(value: unknown, path: string, readItem: Reader<T>): T[] {
  if (!Array.isArray(value)) throw new ContentError(path, 'expected a list');
  return value.map((item, index) => readItem(item, `${path}[${index}]`));
}

function readOneOf<T extends string>(value: unknown, path: string, options: readonly T[]): T {
  if (typeof value !== 'string' || !options.includes(value as T)) {
    throw new ContentError(path, `expected one of ${options.join(', ')}`);
  }
  return value as T;
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function readColor(value: unknown, path: string): string {
  const text = readText(value, path);
  if (!HEX_COLOR.test(text)) throw new ContentError(path, 'expected a hex color like #ff8800');
  return text;
}

const SAFE_URL = /^(?:https?:\/\/|mailto:|\/|\.{0,2}\/|#)/i;

function readUrl(value: unknown, path: string): string {
  const text = readText(value, path);
  if (!SAFE_URL.test(text)) throw new ContentError(path, 'expected an http(s), mailto or relative URL');
  return text;
}

/* ---------- content readers ---------- */

const readFlower: Reader<FlowerSpec> = (value, path) => {
  const o = readObject(value, path);
  return {
    shape: readOneOf(o.shape, `${path}.shape`, PETAL_SHAPE_IDS),
    petal: readColor(o.petal, `${path}.petal`),
    outline: readColor(o.outline, `${path}.outline`),
    core: readColor(o.core, `${path}.core`),
  };
};

const readLink: Reader<ProjectLink> = (value, path) => {
  const o = readObject(value, path);
  const label = readText(o.label, `${path}.label`);
  return o.href === undefined ? { label } : { label, href: readUrl(o.href, `${path}.href`) };
};

const readProject: Reader<Project> = (value, path) => {
  const o = readObject(value, path);
  return {
    id: readText(o.id, `${path}.id`),
    title: readText(o.title, `${path}.title`),
    summary: readText(o.summary, `${path}.summary`),
    description: readText(o.description, `${path}.description`),
    links: readList(o.links ?? [], `${path}.links`, readLink),
    flower: readFlower(o.flower, `${path}.flower`),
  };
};

const readArea: Reader<Area> = (value, path) => {
  const o = readObject(value, path);
  return {
    id: readText(o.id, `${path}.id`),
    title: readText(o.title, `${path}.title`),
    projects: readList(o.projects, `${path}.projects`, readProject),
  };
};

const readWelcome: Reader<WelcomeContent> = (value, path) => {
  const o = readObject(value, path);
  return {
    kicker: readText(o.kicker, `${path}.kicker`),
    title: readText(o.title, `${path}.title`),
    subtitle: readText(o.subtitle, `${path}.subtitle`),
    hint: readText(o.hint, `${path}.hint`),
  };
};

function assertUniqueIds(areas: readonly Area[]): void {
  const seen = new Set<string>();
  const check = (id: string, path: string): void => {
    if (seen.has(id)) throw new ContentError(path, `id "${id}" is used more than once`);
    seen.add(id);
  };
  areas.forEach((area, a) => {
    check(area.id, `areas[${a}].id`);
    area.projects.forEach((project, p) => check(project.id, `areas[${a}].projects[${p}].id`));
  });
}

/**
 * Checks raw JSON and returns typed garden content.
 * Errors point at the exact field, e.g. `garden.json › areas[0].projects[2].flower.shape`.
 */
export function parseGarden(raw: unknown): GardenContent {
  const o = readObject(raw, 'root');
  const areas = readList(o.areas, 'areas', readArea);
  assertUniqueIds(areas);
  return {
    welcome: readWelcome(o.welcome, 'welcome'),
    areas,
    footer: readText(o.footer, 'footer'),
  };
}

/** A project together with the area it grows in. */
export interface PlantedProject {
  readonly project: Project;
  readonly area: Area;
}

/** All projects of the garden, by id. */
export function indexProjects(areas: readonly Area[]): ReadonlyMap<string, PlantedProject> {
  return new Map(
    areas.flatMap((area) => area.projects.map((project) => [project.id, { project, area }] as const)),
  );
}

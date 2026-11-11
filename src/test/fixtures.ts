import type { Area, GardenContent, Project } from "../domain/types";

/** A valid project; override only what a test is about. */
export const makeProject = (
  id: string,
  overrides: Partial<Project> = {},
): Project => ({
  id,
  title: `Title ${id}`,
  summary: `Summary ${id}`,
  description: `Description ${id}`,
  tags: [],
  links: [],
  flower: {
    shape: "daisy",
    petal: "#ffffff",
    outline: "#000000",
    core: "#ffcc00",
  },
  ...overrides,
});

export const makeArea = (
  id: string,
  projects: readonly Project[],
  overrides: Partial<Area> = {},
): Area => ({
  id,
  title: `Area ${id}`,
  tagline: `tagline ${id}`,
  setting: "meadow",
  projects,
  ...overrides,
});

/** A small garden: a meadow with two projects, then a greenhouse with one. */
export const makeContent = (
  areas: readonly Area[] = [
    makeArea("meadow", [makeProject("a"), makeProject("b")]),
    makeArea("glass", [makeProject("c")], {
      setting: "greenhouse",
      note: "ask me",
    }),
  ],
): GardenContent => ({
  brand: "bee",
  welcome: {
    kicker: "Welcome to",
    title: "Garden",
    subtitle: "Hello",
    cta: "Go",
    hint: "Scroll",
  },
  areas,
  footer: "Footer",
});

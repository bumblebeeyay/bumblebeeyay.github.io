import type { Area, Project } from "./types";

/** A project together with the area it grows in and its place in the walk. */
export interface PlantedProject {
  readonly project: Project;
  readonly area: Area;
  /** 1-based position in the whole garden, left to right. */
  readonly number: number;
}

/** All projects of the garden, by id, in walking order. */
export function indexProjects(
  areas: readonly Area[],
): ReadonlyMap<string, PlantedProject> {
  const all = areas.flatMap((area) =>
    area.projects.map((project) => ({ project, area })),
  );
  return new Map(
    all.map(
      (entry, i) => [entry.project.id, { ...entry, number: i + 1 }] as const,
    ),
  );
}

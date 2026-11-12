import { describe, expect, it } from "vitest";
import { makeArea, makeProject } from "../test/fixtures";
import { indexProjects } from "./garden";

describe("indexProjects", () => {
  const areas = [
    makeArea("first", [makeProject("a"), makeProject("b")]),
    makeArea("second", [makeProject("c")]),
  ];

  it("finds projects and their area by id", () => {
    const entry = indexProjects(areas).get("b");
    expect(entry?.project.id).toBe("b");
    expect(entry?.area.id).toBe("first");
  });

  it("numbers projects across areas, in walking order", () => {
    const index = indexProjects(areas);
    expect([...index.keys()]).toEqual(["a", "b", "c"]);
    expect(index.get("c")?.number).toBe(3);
    expect(index.get("c")?.area.id).toBe("second");
  });

  it("is empty for an empty garden", () => {
    expect(indexProjects([]).size).toBe(0);
  });
});

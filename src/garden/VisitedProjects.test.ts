import { describe, expect, it } from "vitest";
import { VisitedProjects, type KeyValueStore } from "./VisitedProjects";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
}

const known = new Set(["a", "b", "c"]);

describe("VisitedProjects", () => {
  it("remembers visits across instances", () => {
    const store = memoryStore();
    new VisitedProjects(known, store).add("a");
    expect(new VisitedProjects(known, store).has("a")).toBe(true);
  });

  it("ignores unknown and malformed stored ids", () => {
    const store = memoryStore({ "bees-garden:visited": '["a", "gone", 3]' });
    expect([...new VisitedProjects(known, store).ids]).toEqual(["a"]);
  });

  it("survives corrupt storage", () => {
    const store = memoryStore({ "bees-garden:visited": "{oops" });
    expect(new VisitedProjects(known, store).ids.size).toBe(0);
  });

  it("works without storage", () => {
    const visited = new VisitedProjects(known, null);
    visited.add("b");
    expect(visited.has("b")).toBe(true);
  });

  it("notifies subscribers once per new visit", () => {
    const visited = new VisitedProjects(known, null);
    const sizes: number[] = [];
    visited.subscribe((ids) => sizes.push(ids.size));
    visited.add("a");
    visited.add("a");
    expect(sizes).toEqual([0, 1]);
  });
});

import { describe, expect, it } from "vitest";
import { parseGarden } from "../domain/parseGarden";
import { makeContent } from "../test/fixtures";
import { PAGE_IDS, areaTitleId, listAreaTitleId } from "./ids";

describe("page ids", () => {
  it("are all different", () => {
    expect(new Set(PAGE_IDS).size).toBe(PAGE_IDS.length);
  });

  it("derive ids content can never take, since slugs have no double hyphen", () => {
    for (const derived of [areaTitleId("a"), listAreaTitleId("a")]) {
      const content = {
        ...makeContent(),
        areas: [{ ...makeContent().areas[0], id: derived }],
      };
      expect(() => parseGarden(content)).toThrow("expected a slug");
    }
  });
});

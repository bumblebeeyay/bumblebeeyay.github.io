import { describe, expect, it } from "vitest";
import { indexProjects } from "../domain/garden";
import { makeArea, makeProject } from "../test/fixtures";
import { renderHerbariumSheet, specimenNumber } from "./herbarium";
import { SHEET_TITLE_ID } from "./ids";

describe("specimenNumber", () => {
  it("pads specimen numbers to two digits", () => {
    expect(specimenNumber(3)).toBe("No. 03");
    expect(specimenNumber(12)).toBe("No. 12");
    expect(specimenNumber(123)).toBe("No. 123");
  });
});

describe("renderHerbariumSheet", () => {
  const project = makeProject("a", {
    title: "Daisy",
    tags: ["TypeScript"],
    links: [{ label: "Code", href: "https://example.com" }, { label: "Soon" }],
  });
  const entry = indexProjects([
    makeArea("meadow", [makeProject("z"), project]),
  ]).get("a");
  if (!entry) throw new Error("fixture");
  const sheet = renderHerbariumSheet(entry, "bee");

  it("titles the sheet with the project, for the dialog's label", () => {
    expect(sheet.querySelector(`#${SHEET_TITLE_ID}`)?.textContent).toBe(
      "Daisy",
    );
  });

  it("numbers the specimen and names its habitat", () => {
    expect(sheet.textContent).toContain("No. 02 · Area meadow");
    expect(sheet.querySelector(".specimen-label")?.textContent).toContain("02");
  });

  it("turns links into seed packets and bare labels into notes", () => {
    const packet = sheet.querySelector<HTMLAnchorElement>(".seed-packet");
    expect(packet?.getAttribute("href")).toBe("https://example.com");
    expect(packet?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(sheet.querySelector(".sheet__note")?.textContent).toBe("Soon");
  });

  it("stamps the tags, and draws the flowers already open", () => {
    expect(sheet.querySelector(".sheet__stamps")?.textContent).toBe(
      "TypeScript",
    );
    for (const flower of sheet.querySelectorAll(".flower")) {
      expect(flower.classList.contains("is-bloomed")).toBe(true);
    }
  });

  it("leaves out empty tag and link lists", () => {
    const bare = indexProjects([makeArea("m", [makeProject("b")])]).get("b");
    if (!bare) throw new Error("fixture");
    const plain = renderHerbariumSheet(bare, "bee");
    expect(plain.querySelector(".sheet__stamps")).toBeNull();
    expect(plain.querySelector(".sheet__links")).toBeNull();
  });
});

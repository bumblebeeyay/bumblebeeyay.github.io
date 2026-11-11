import { describe, expect, it } from "vitest";
import { h } from "../dom/create";
import { makeArea, makeProject } from "../test/fixtures";
import { listAreaTitleId } from "./ids";
import { renderProjectList, showProjectId } from "./list";

const areas = [
  makeArea("meadow", [
    makeProject("a", {
      links: [
        { label: "Code", href: "https://example.com" },
        { label: "Private" },
      ],
    }),
    makeProject("b"),
  ]),
];

describe("renderProjectList", () => {
  const [section] = renderProjectList(areas);

  it("draws one section per area, labelled by its heading", () => {
    expect(renderProjectList(areas)).toHaveLength(1);
    const titleId = listAreaTitleId("meadow");
    expect(section?.getAttribute("aria-labelledby")).toBe(titleId);
    expect(section?.querySelector(`#${titleId}`)?.textContent).toContain(
      "Area meadow",
    );
  });

  it("lists every project with a button to see it in the garden", () => {
    const buttons = [...(section?.querySelectorAll("button") ?? [])];
    expect(buttons.map((button) => showProjectId(button))).toEqual(["a", "b"]);
  });

  it("opens links in a new tab, safely, and shows bare labels as text", () => {
    const link = section?.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(section?.textContent).toContain("Private");
    expect(section?.querySelectorAll("a")).toHaveLength(1);
  });
});

describe("showProjectId", () => {
  it("finds the project from a click inside the button", () => {
    const [section] = renderProjectList(areas);
    const button = section?.querySelector("button");
    const inner = h("span");
    button?.append(inner);
    expect(showProjectId(inner)).toBe("a");
  });

  it("is null elsewhere, or for non-elements", () => {
    expect(showProjectId(h("div"))).toBeNull();
    expect(showProjectId(null)).toBeNull();
    expect(showProjectId(window)).toBeNull();
  });
});

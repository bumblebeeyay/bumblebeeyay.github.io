import { describe, expect, it } from "vitest";
import rawGarden from "../data/garden.json";
import { PAGE_IDS } from "../views/ids";
import { ContentError, parseGarden } from "./parseGarden";

const project = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: "Title",
  summary: "Summary",
  description: "Description",
  links: [{ label: "Code", href: "https://example.com" }],
  flower: {
    shape: "daisy",
    petal: "#ffffff",
    outline: "#000",
    core: "#ffcc00",
  },
  ...overrides,
});

const area = (
  id: string,
  projects: unknown[],
  overrides: Record<string, unknown> = {},
) => ({
  id,
  title: "Area",
  tagline: "tagline",
  setting: "meadow",
  projects,
  ...overrides,
});

const garden = (projects: unknown[]) => ({
  brand: "bee",
  welcome: {
    kicker: "Welcome to",
    title: "Garden",
    subtitle: "Hello",
    cta: "Go",
    hint: "Scroll",
  },
  areas: [
    {
      id: "public",
      title: "Public",
      tagline: "open",
      setting: "meadow",
      projects,
    },
  ],
  footer: "Footer",
});

describe("parseGarden", () => {
  it("accepts valid content", () => {
    const content = parseGarden(garden([project("a")]));
    expect(content.areas[0]?.projects[0]?.flower.shape).toBe("daisy");
  });

  it("defaults missing links to empty lists", () => {
    const content = parseGarden(garden([project("a", { links: undefined })]));
    expect(content.areas[0]?.projects[0]?.links).toEqual([]);
  });

  it("defaults missing tags to empty lists", () => {
    const content = parseGarden(garden([project("a")]));
    expect(content.areas[0]?.projects[0]?.tags).toEqual([]);
  });

  it("rejects unknown settings", () => {
    const bad = {
      ...garden([]),
      areas: [
        { id: "x", title: "X", tagline: "x", setting: "desert", projects: [] },
      ],
    };
    expect(() => parseGarden(bad)).toThrow("areas[0].setting");
  });

  it("names the exact field that is wrong", () => {
    const bad = garden([
      project("a", {
        flower: {
          shape: "cactus",
          petal: "#fff",
          outline: "#000",
          core: "#ff0",
        },
      }),
    ]);
    expect(() => parseGarden(bad)).toThrow("areas[0].projects[0].flower.shape");
  });

  it("rejects bad colors", () => {
    const bad = garden([
      project("a", {
        flower: { shape: "daisy", petal: "red", outline: "#000", core: "#ff0" },
      }),
    ]);
    expect(() => parseGarden(bad)).toThrow(ContentError);
  });

  it("rejects javascript: links", () => {
    const bad = garden([
      project("a", { links: [{ label: "x", href: "javascript:alert(1)" }] }),
    ]);
    expect(() => parseGarden(bad)).toThrow("links[0].href");
  });

  it("rejects duplicate ids", () => {
    expect(() => parseGarden(garden([project("a"), project("a")]))).toThrow(
      "used more than once",
    );
  });

  it("accepts relative, anchor, mailto and http(s) links", () => {
    const hrefs = [
      "https://example.com",
      "http://example.com",
      "mailto:bee@example.com",
      "/dnd",
      "./dnd",
      "../dnd",
      "#top",
    ];
    const links = hrefs.map((href) => ({ label: "x", href }));
    const content = parseGarden(garden([project("a", { links })]));
    expect(content.areas[0]?.projects[0]?.links.map((l) => l.href)).toEqual(
      hrefs,
    );
  });

  it.each(["data:text/html,hi", "ftp://example.com", "example.com"])(
    "rejects the unsafe or ambiguous link %s",
    (href) => {
      const bad = garden([project("a", { links: [{ label: "x", href }] })]);
      expect(() => parseGarden(bad)).toThrow("links[0].href");
    },
  );

  it("keeps a link without href as a plain note, with no href key", () => {
    const content = parseGarden(
      garden([project("a", { links: [{ label: "Ask me" }] })]),
    );
    const link = content.areas[0]?.projects[0]?.links[0];
    expect(link).toEqual({ label: "Ask me" });
    expect(link && "href" in link).toBe(false);
  });

  it("reads an area's optional note, and leaves no key when absent", () => {
    const content = parseGarden({
      ...garden([]),
      areas: [area("with", [], { note: "ask me" }), area("without", [])],
    });
    expect(content.areas[0]?.note).toBe("ask me");
    expect(content.areas[1] && "note" in content.areas[1]).toBe(false);
  });

  it("rejects an empty note", () => {
    const bad = { ...garden([]), areas: [area("x", [], { note: "  " })] };
    expect(() => parseGarden(bad)).toThrow("areas[0].note");
  });

  it("rejects lists that are not lists", () => {
    expect(() => parseGarden({ ...garden([]), areas: {} })).toThrow(
      "areas: expected a list",
    );
    expect(() =>
      parseGarden(garden([project("a", { tags: "TypeScript" })])),
    ).toThrow("projects[0].tags: expected a list");
  });

  it("rejects a root that is not an object", () => {
    expect(() => parseGarden([])).toThrow("root: expected an object");
    expect(() => parseGarden(null)).toThrow("root: expected an object");
  });

  it("rejects a missing top-level field", () => {
    const content: Record<string, unknown> = garden([]);
    delete content.footer;
    expect(() => parseGarden(content)).toThrow("footer");
  });

  it("rejects an area and a project sharing an id", () => {
    const bad = { ...garden([]), areas: [area("same", [project("same")])] };
    expect(() => parseGarden(bad)).toThrow(
      'areas[0].projects[0].id: id "same" is used more than once',
    );
  });

  describe("ids", () => {
    it.each(["a", "my-project", "public-3", "2026"])(
      "accepts the slug %s",
      (id) => {
        expect(() => parseGarden(garden([project(id)]))).not.toThrow();
      },
    );

    it.each([
      "My-Project",
      "my project",
      "my--project",
      "-start",
      "end-",
      'quo"te',
      "é",
    ])("rejects %j, which is not a slug", (id) => {
      expect(() => parseGarden(garden([project(id)]))).toThrow(
        "areas[0].projects[0].id: expected a slug",
      );
    });

    it("rejects area ids that are not slugs either", () => {
      const bad = { ...garden([]), areas: [area("Public Meadow", [])] };
      expect(() => parseGarden(bad)).toThrow("areas[0].id: expected a slug");
    });

    it("rejects ids reserved by the page", () => {
      const bad = { ...garden([]), areas: [area("hive", [])] };
      expect(() => parseGarden(bad, { reservedIds: ["hive"] })).toThrow(
        'areas[0].id: id "hive" is reserved by the page',
      );
    });

    it("reserves nothing by default", () => {
      const content = { ...garden([]), areas: [area("hive", [])] };
      expect(() => parseGarden(content)).not.toThrow();
    });
  });

  it("accepts the real garden.json with the page's reserved ids", () => {
    expect(() =>
      parseGarden(rawGarden, { reservedIds: PAGE_IDS }),
    ).not.toThrow();
  });
});

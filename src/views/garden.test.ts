import { describe, expect, it } from "vitest";
import { makeContent } from "../test/fixtures";
import { placeAt, renderGarden } from "./garden";
import { HIVE_ID, areaTitleId } from "./ids";
import { GO_TO_ATTRIBUTE } from "./navigation";

describe("renderGarden", () => {
  const garden = renderGarden(makeContent());

  it("lays out the hive, then every area, in order", () => {
    expect(garden.places.map((place) => place.id)).toEqual([
      HIVE_ID,
      "meadow",
      "glass",
    ]);
  });

  it("returns every plot by project id, in walking order", () => {
    expect([...garden.plots.keys()]).toEqual(["a", "b", "c"]);
    expect(garden.viewport.contains(garden.plots.get("c") ?? null)).toBe(true);
  });

  it("returns the greenhouse walls, with the plots inside them", () => {
    expect(garden.greenhouses).toHaveLength(1);
    expect(garden.greenhouses[0]?.contains(garden.plots.get("c") ?? null)).toBe(
      true,
    );
  });

  it("links each area's heading with derived ids that cannot clash with content", () => {
    const meadow = garden.places[1];
    expect(meadow?.getAttribute("aria-labelledby")).toBe(areaTitleId("meadow"));
    expect(meadow?.querySelector(`#${areaTitleId("meadow")}`)).not.toBeNull();
  });

  it("points each signpost to the next area, and none from the last", () => {
    const targets = garden.places.map((place) =>
      [...place.querySelectorAll(`[${GO_TO_ATTRIBUTE}]`)].map((button) =>
        button.getAttribute(GO_TO_ATTRIBUTE),
      ),
    );
    expect(targets).toEqual([["meadow"], ["glass"], []]);
  });

  it("puts the scroll container inside the zoomed scene", () => {
    expect(garden.scene.contains(garden.viewport)).toBe(true);
  });
});

describe("placeAt", () => {
  const places = [
    { id: "hive", offsetLeft: 0 },
    { id: "meadow", offsetLeft: 1000 },
    { id: "glass", offsetLeft: 2500 },
  ];

  it("finds the last place starting at or before x", () => {
    expect(placeAt(places, 999)?.id).toBe("hive");
    expect(placeAt(places, 1000)?.id).toBe("meadow");
    expect(placeAt(places, 2400)?.id).toBe("meadow");
    expect(placeAt(places, 9000)?.id).toBe("glass");
  });

  it("falls back to the first place before them all", () => {
    expect(placeAt(places, -50)?.id).toBe("hive");
  });

  it("finds nothing in an empty garden", () => {
    expect(placeAt([], 0)).toBeUndefined();
  });
});

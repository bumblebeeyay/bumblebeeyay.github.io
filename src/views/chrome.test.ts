import { describe, expect, it } from "vitest";
import { h } from "../dom/create";
import { makeArea } from "../test/fixtures";
import { renderGardenMap } from "./gardenMap";
import { HIVE_ID } from "./ids";
import { GO_TO_ATTRIBUTE, goTo, goToPlaceId } from "./navigation";
import { renderTopbar } from "./topbar";

describe("navigation", () => {
  it("marks a control with the place it leads to", () => {
    const button = h("button", goTo("meadow"), h("span", {}, "Meadow"));
    expect(button.getAttribute(GO_TO_ATTRIBUTE)).toBe("meadow");
    expect(goToPlaceId(button.firstElementChild)).toBe("meadow");
  });

  it("finds nothing outside go-to controls", () => {
    expect(goToPlaceId(h("button"))).toBeNull();
    expect(goToPlaceId(null)).toBeNull();
  });
});

describe("renderGardenMap", () => {
  const map = renderGardenMap([makeArea("meadow", []), makeArea("glass", [])]);
  const stops = [...map.element.querySelectorAll("button")];

  it("has a stop for the hive and each area", () => {
    expect(stops.map((stop) => goToPlaceId(stop))).toEqual([
      HIVE_ID,
      "meadow",
      "glass",
    ]);
  });

  it("marks only the current stop", () => {
    map.setCurrent("meadow");
    map.setCurrent("glass");
    expect(stops.map((stop) => stop.getAttribute("aria-current"))).toEqual([
      null,
      null,
      "location",
    ]);
  });
});

describe("renderTopbar", () => {
  const topbar = renderTopbar("bee");

  it("leads back to the hive from the brand", () => {
    const brand = topbar.element.querySelector(".topbar__brand");
    expect(goToPlaceId(brand)).toBe(HIVE_ID);
  });

  it("fills the honey jar with the share of visited flowers", () => {
    const honey = topbar.element.querySelector(".honey-jar__honey");
    topbar.setVisited(1, 2);
    expect(topbar.element.textContent).toContain("1 / 2");
    expect(honey?.getAttribute("height")).toBe("13");
    expect(honey?.getAttribute("y")).toBe("25");

    topbar.setVisited(0, 0);
    expect(honey?.getAttribute("height")).toBe("0");
  });

  it("says where the night switch takes you", () => {
    topbar.setNight(true);
    expect(topbar.nightButton.getAttribute("aria-label")).toBe("Switch to day");
    topbar.setNight(false);
    expect(topbar.nightButton.getAttribute("aria-label")).toBe(
      "Switch to night",
    );
  });
});

/**
 * Integration tests: the real garden DOM, dialog, camera, scroller, bee and visits,
 * wired the way `main.ts` wires them. Only the browser's layout is missing (happy-dom),
 * so positions are zero and transitions never end on their own.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Bee } from "../bee/Bee";
import type { BeeBehaviour } from "../bee/behaviours";
import { vec2 } from "../util/vec2";
import { h } from "../dom/create";
import { indexProjects } from "../domain/garden";
import { makeContent } from "../test/fixtures";
import { renderGarden } from "../views/garden";
import { SHEET_TITLE_ID } from "../views/ids";
import { WorldScroller } from "../world/WorldScroller";
import { GardenApp } from "./GardenApp";
import { GardenCamera } from "./GardenCamera";
import { followGoToLinks } from "./goToPlaces";
import { ListDialog } from "./ListDialog";
import { ProjectDialog } from "./ProjectDialog";
import { VisitedProjects } from "./VisitedProjects";

/** Generous wait: under a loaded machine (CI, a full parallel run) a frame can take long. */
const SLOW_MACHINE = { timeout: 5_000 };

const still = (name: string): BeeBehaviour & { name: string } => ({
  name,
  speed: 0.1,
  bobs: false,
  targetAt: () => vec2(0, 0),
});

function setUp({ reducedMotion = true } = {}) {
  const content = makeContent();
  const projects = indexProjects(content.areas);
  const garden = renderGarden(content);
  const dialog = new ProjectDialog(content.brand);
  const list = new ListDialog(content.areas);
  const controls = h("header");
  const beeElement = h("div");
  document.body.replaceChildren(
    garden.scene,
    controls,
    dialog.element,
    list.element,
    beeElement,
  );

  // happy-dom does not scroll: record scroll requests instead.
  const scrollTo = vi.fn();
  garden.viewport.scrollTo = scrollTo;

  const scroller = new WorldScroller(
    garden.viewport,
    garden.scene,
    reducedMotion,
  );
  const visited = new VisitedProjects(new Set(projects.keys()), null);
  const exploring = still("exploring");
  const reading = still("reading");
  const bee = new Bee(beeElement, vec2(0, 0), exploring);
  // Handing the bee its reading behaviour is the very last step of a visit.
  const setBehaviour = vi.spyOn(bee, "setBehaviour");
  const app = new GardenApp({
    scroller,
    projects,
    plots: garden.plots,
    bee,
    camera: new GardenCamera(garden.scene, [controls]),
    dialog,
    visited,
    exploring,
    reading,
    reducedMotion,
  });
  app.start();
  const stopGoTo = followGoToLinks(document, scroller, () => app.isExploring);
  list.onShowInGarden((id) => void app.visitById(id));

  const plot = (id: string): HTMLElement => {
    const element = garden.plots.get(id);
    if (!element) throw new Error(`no plot ${id}`);
    return element;
  };
  const sheetTitle = () =>
    dialog.element.querySelector(`#${SHEET_TITLE_ID}`)?.textContent;
  /** The close animation never ends by itself without a layout engine. */
  const endTransitions = () =>
    dialog.element.dispatchEvent(new Event("transitionend"));
  const press = (key: string) =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key, cancelable: true }),
    );

  return {
    app,
    bee,
    controls,
    dialog,
    garden,
    list,
    plot,
    press,
    reading,
    scroller,
    scrollTo,
    setBehaviour,
    sheetTitle,
    endTransitions,
    stopGoTo,
    visited,
  };
}

/** Waits until a visit has fully opened (its last step is handing the bee its reading behaviour). */
async function openedVisit(world: ReturnType<typeof setUp>): Promise<void> {
  await vi.waitFor(
    () => expect(world.setBehaviour).toHaveBeenLastCalledWith(world.reading),
    SLOW_MACHINE,
  );
  world.setBehaviour.mockClear();
}

async function leftVisit(world: ReturnType<typeof setUp>): Promise<void> {
  world.press("Escape");
  world.endTransitions();
  await vi.waitFor(
    () => expect(world.app.isExploring).toBe(true),
    SLOW_MACHINE,
  );
}

describe("GardenApp, wired to the real garden", () => {
  let world: ReturnType<typeof setUp>;

  beforeEach(() => {
    world = setUp();
  });

  afterEach(() => {
    // ProjectDialog listens on `document` for good: close it, or it answers the next test's keys.
    world.dialog.element.close();
    world.stopGoTo();
    document.documentElement.classList.remove("is-reading");
  });

  describe("visiting a flower", () => {
    it("opens the clicked project's sheet", async () => {
      world.plot("a").click();
      await openedVisit(world);
      expect(world.sheetTitle()).toBe("Title a");
    });

    it("blooms the flower and remembers the visit", async () => {
      world.plot("a").click();
      await openedVisit(world);
      expect(
        world
          .plot("a")
          .querySelector(".flower")
          ?.classList.contains("is-bloomed"),
      ).toBe(true);
      await vi.waitFor(
        () => expect(world.visited.ids.has("a")).toBe(true),
        SLOW_MACHINE,
      );
    });

    it("freezes the garden behind the sheet", async () => {
      world.plot("a").click();
      await openedVisit(world);
      expect(world.scroller.enabled).toBe(false);
      expect(document.documentElement.classList.contains("is-reading")).toBe(
        true,
      );
      expect(world.garden.scene.inert).toBe(true);
      expect(world.controls.inert).toBe(true);
    });

    it("sets the bee circling the sheet, and back to exploring after", async () => {
      world.plot("a").click();
      await openedVisit(world);
      expect(world.dialog.isOpen).toBe(true);
      await leftVisit(world);
      expect(world.setBehaviour).toHaveBeenCalledWith(
        expect.objectContaining({ name: "exploring" }),
      );
    });

    it("ignores a second flower while the first one is opening", async () => {
      world.plot("a").click();
      world.plot("b").click();
      await openedVisit(world);
      expect(world.sheetTitle()).toBe("Title a");
      expect(world.visited.ids.has("b")).toBe(false);
    });

    it("flies the bee to the flower first, unless motion is reduced", async () => {
      world.dialog.element.close();
      world.stopGoTo();
      world = setUp({ reducedMotion: false });
      const flyTo = vi.spyOn(world.bee, "flyTo").mockResolvedValue();
      world.plot("a").click();
      await openedVisit(world);
      expect(flyTo).toHaveBeenCalledOnce();
    });

    it("does not fly with reduced motion", async () => {
      const flyTo = vi.spyOn(world.bee, "flyTo");
      world.plot("a").click();
      await openedVisit(world);
      expect(flyTo).not.toHaveBeenCalled();
    });
  });

  describe("flipping through sheets", () => {
    beforeEach(async () => {
      world.plot("a").click();
      await openedVisit(world);
    });

    it("shows the next project with the right arrow, and counts it as visited", () => {
      world.press("ArrowRight");
      expect(world.sheetTitle()).toBe("Title b");
      expect(world.visited.ids.has("b")).toBe(true);
    });

    it("crosses into the next area", () => {
      world.press("ArrowRight");
      world.press("ArrowRight");
      expect(world.sheetTitle()).toBe("Title c");
    });

    it("wraps around both ends of the garden", () => {
      world.press("ArrowLeft");
      expect(world.sheetTitle()).toBe("Title c");
      world.press("ArrowRight");
      expect(world.sheetTitle()).toBe("Title a");
    });

    it("also flips with the on-screen buttons", () => {
      world.dialog.element
        .querySelector<HTMLButtonElement>(".herbarium__step--next")
        ?.click();
      expect(world.sheetTitle()).toBe("Title b");
    });
  });

  describe("leaving", () => {
    beforeEach(async () => {
      world.plot("a").click();
      await openedVisit(world);
    });

    it("closes the sheet and gives the garden back", async () => {
      await leftVisit(world);
      expect(world.dialog.isOpen).toBe(false);
      expect(world.scroller.enabled).toBe(true);
      expect(world.garden.scene.inert).toBe(false);
      expect(document.documentElement.classList.contains("is-reading")).toBe(
        false,
      );
    });

    it("comes back to the last sheet's flower, and focuses it", async () => {
      world.press("ArrowRight");
      await leftVisit(world);
      expect(document.activeElement).toBe(world.plot("b"));
      expect(world.scrollTo).toHaveBeenCalled();
    });

    it("also leaves from the back button and from beside the sheet", async () => {
      world.dialog.element
        .querySelector<HTMLButtonElement>(".herbarium__back")
        ?.click();
      world.endTransitions();
      await vi.waitFor(
        () => expect(world.app.isExploring).toBe(true),
        SLOW_MACHINE,
      );

      world.plot("a").click();
      await openedVisit(world);
      world.dialog.element.click();
      world.endTransitions();
      await vi.waitFor(
        () => expect(world.app.isExploring).toBe(true),
        SLOW_MACHINE,
      );
    });

    it("lets the visitor open another flower afterwards", async () => {
      await leftVisit(world);
      world.plot("c").click();
      await openedVisit(world);
      expect(world.sheetTitle()).toBe("Title c");
    });
  });

  describe("from the list view", () => {
    it("walks to the chosen flower and opens it", async () => {
      world.list.open();
      world.list.element
        .querySelectorAll<HTMLButtonElement>(".list-dialog__show")[2]
        ?.click();
      await openedVisit(world);
      expect(world.list.element.open).toBe(false);
      expect(world.sheetTitle()).toBe("Title c");
      expect(world.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "instant" }),
      );
    });

    it("does nothing for an unknown project", async () => {
      await world.app.visitById("nope");
      expect(world.app.isExploring).toBe(true);
      expect(world.dialog.isOpen).toBe(false);
    });
  });

  describe("signposts", () => {
    it("walk the garden to the next area", () => {
      const signpost =
        world.garden.places[1]?.querySelector<HTMLElement>(".arrow-sign");
      signpost?.click();
      expect(world.scrollTo).toHaveBeenCalledOnce();
    });

    it("stay put while a project is open", async () => {
      world.plot("a").click();
      await openedVisit(world);
      world.scrollTo.mockClear();
      world.garden.places[1]
        ?.querySelector<HTMLElement>(".arrow-sign")
        ?.click();
      expect(world.scrollTo).not.toHaveBeenCalled();
    });
  });
});

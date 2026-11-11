import "./styles/index.css";

import { Bee } from "./bee/Bee";
import { Circling, FollowPointer } from "./bee/behaviours";
import { renderBee } from "./bee/renderBee";
import { startLoop } from "./dom/loop";
import { canHover, prefersReducedMotion } from "./dom/media";
import { isNightAt } from "./util/time";
import { vec2 } from "./util/vec2";
import rawGarden from "./data/garden.json";
import { h } from "./dom/create";
import { indexProjects } from "./domain/garden";
import { parseGarden } from "./domain/parseGarden";
import { bloomOnView } from "./garden/bloomOnView";
import { GardenApp } from "./garden/GardenApp";
import { GardenCamera } from "./garden/GardenCamera";
import { followGoToLinks } from "./garden/goToPlaces";
import { GreenhouseFog } from "./garden/GreenhouseFog";
import { ListDialog } from "./garden/ListDialog";
import { NightMode, syncThemeColor } from "./garden/NightMode";
import { ProjectDialog } from "./garden/ProjectDialog";
import { VisitedProjects } from "./garden/VisitedProjects";
import { PointerTracker } from "./input/PointerTracker";
import { placeAt, renderGarden } from "./views/garden";
import { renderGardenMap } from "./views/gardenMap";
import { PAGE_IDS } from "./views/ids";
import { setPlotVisited } from "./views/plot";
import { renderTopbar } from "./views/topbar";
import { WorldScroller } from "./world/WorldScroller";

/** Composition root: the only place that knows every piece and wires them together. */
function main(root: HTMLElement): void {
  const content = parseGarden(rawGarden, { reservedIds: PAGE_IDS });
  const projects = indexProjects(content.areas);
  const reducedMotion = prefersReducedMotion();

  const { scene, viewport, places, plots, greenhouses } = renderGarden(content);
  const topbar = renderTopbar(content.brand);
  const map = renderGardenMap(content.areas);
  const dialog = new ProjectDialog(content.brand);
  const list = new ListDialog(content.areas);
  const beeElement = renderBee();
  root.append(
    scene,
    topbar.element,
    map.element,
    dialog.element,
    list.element,
    beeElement,
  );

  // Moving around
  const scroller = new WorldScroller(viewport, scene, reducedMotion);
  scroller.start();
  scroller.onScroll((x) => {
    const here = placeAt(places, x + viewport.clientWidth / 2);
    if (here) map.setCurrent(here.id);
  });

  // Day and night
  const night = new NightMode(isNightAt(new Date()));
  night.subscribe((isNight) => {
    topbar.setNight(isNight);
    syncThemeColor();
  });
  topbar.nightButton.addEventListener("click", () => night.toggle());

  // Visited flowers and the honey jar
  const visited = new VisitedProjects(new Set(projects.keys()));
  visited.subscribe((ids) => {
    topbar.setVisited(ids.size, visited.total);
    for (const [id, plot] of plots) {
      const entry = projects.get(id);
      if (entry) setPlotVisited(plot, entry.project, ids.has(id));
    }
  });

  for (const greenhouse of greenhouses) new GreenhouseFog(greenhouse).start();

  // The bee
  const idleSpot = () => vec2(innerWidth * 0.62, innerHeight * 0.3);
  const exploring = new FollowPointer(
    new PointerTracker(window),
    new Circling(idleSpot, {
      radius: vec2(60, 40),
      speed: 0.02,
      periodMs: 8800,
      fallbackCenter: idleSpot(),
    }),
  );
  const reading = new Circling(() => dialog.flowerHeadPosition, {
    radius: vec2(50, 16),
    speed: 0.05,
    periodMs: 4400,
    fallbackCenter: idleSpot(),
  });
  const bee = new Bee(beeElement, idleSpot(), exploring);
  startLoop((dt, time) => bee.update(dt, time));

  const app = new GardenApp({
    scroller,
    projects,
    plots,
    bee,
    camera: new GardenCamera(scene, [topbar.element, map.element]),
    dialog,
    visited,
    exploring,
    reading,
    reducedMotion,
  });
  app.start();
  followGoToLinks(document, scroller, () => app.isExploring);

  // The list view, for visitors in a hurry
  topbar.listButton.addEventListener("click", () => {
    // The top bar only turns inert once the camera zooms; until then a visit may be underway.
    if (!app.isExploring) return;
    scroller.enabled = false;
    list.open();
  });
  list.onClose(() => {
    if (app.isExploring) scroller.enabled = true;
  });
  list.onShowInGarden((id) => void app.visitById(id));

  if (!canHover()) bloomOnView(plots.values());
}

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Missing #app element in index.html");

try {
  main(root);
} catch (error) {
  root.replaceChildren(
    h("p", { class: "garden-error" }, "The garden could not grow. 🥀"),
  );
  throw error;
}

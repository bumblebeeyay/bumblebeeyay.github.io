import "./styles/index.css";

import { Bee } from "./bee/Bee";
import { Circling, FollowPointer } from "./bee/behaviours";
import { renderBee } from "./bee/renderBee";
import { startLoop } from "./core/loop";
import { canHover, isNightAt, prefersReducedMotion } from "./core/media";
import { vec2 } from "./core/vec2";
import rawGarden from "./data/garden.json";
import { h } from "./dom/create";
import { indexProjects, parseGarden } from "./domain/parseGarden";
import { bloomOnView } from "./garden/bloomOnView";
import { GardenApp } from "./garden/GardenApp";
import { GardenCamera } from "./garden/GardenCamera";
import { GreenhouseFog } from "./garden/GreenhouseFog";
import { ListDialog } from "./garden/ListDialog";
import { NightMode } from "./garden/NightMode";
import { ProjectDialog } from "./garden/ProjectDialog";
import { VisitedProjects } from "./garden/VisitedProjects";
import { PointerTracker } from "./input/PointerTracker";
import { renderGarden } from "./views/garden";
import { renderGardenMap } from "./views/gardenMap";
import {
  PLOT_SELECTOR,
  PROJECT_ID_ATTRIBUTE,
  setPlotVisited,
} from "./views/plot";
import { renderTopbar } from "./views/topbar";
import { WorldScroller } from "./world/WorldScroller";

/** Composition root: the only place that knows every piece and wires them together. */
function main(root: HTMLElement): void {
  const content = parseGarden(rawGarden);
  const projects = indexProjects(content.areas);
  const reducedMotion = prefersReducedMotion();

  const { scene, viewport, places } = renderGarden(content);
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
    const middle = x + viewport.clientWidth / 2;
    const here =
      places.filter((place) => place.offsetLeft <= middle).at(-1) ?? places[0];
    if (here) map.setCurrent(here.id);
  });

  // Day and night
  const night = new NightMode(isNightAt(new Date()));
  night.subscribe((isNight) => topbar.setNight(isNight));
  topbar.nightButton.addEventListener("click", () => night.toggle());

  // Visited flowers and the honey jar
  const visited = new VisitedProjects(new Set(projects.keys()));
  const plots = [...viewport.querySelectorAll<HTMLElement>(PLOT_SELECTOR)];
  visited.subscribe((ids) => {
    topbar.setVisited(ids.size, visited.total);
    for (const plot of plots) {
      const id = plot.getAttribute(PROJECT_ID_ATTRIBUTE) ?? "";
      const title = projects.get(id)?.project.title ?? "";
      setPlotVisited(plot, title, ids.has(id));
    }
  });

  for (const greenhouse of viewport.querySelectorAll<HTMLElement>(
    ".greenhouse",
  )) {
    new GreenhouseFog(greenhouse).start();
  }

  // The bee
  const idleSpot = () => vec2(innerWidth * 0.62, innerHeight * 0.3);
  const exploring = new FollowPointer(
    new PointerTracker(window),
    new Circling(idleSpot, {
      radius: vec2(60, 40),
      speed: 0.02,
      periodMs: 8800,
    }),
  );
  const reading = new Circling(() => dialog.flowerHeadPosition, {
    radius: vec2(50, 16),
    speed: 0.05,
    periodMs: 4400,
  });
  const bee = new Bee(beeElement, idleSpot(), exploring);
  startLoop((dt, time) => bee.update(dt, time));

  const app = new GardenApp({
    scroller,
    projects,
    bee,
    camera: new GardenCamera(scene, [topbar.element, map.element]),
    dialog,
    visited,
    exploring,
    reading,
    reducedMotion,
  });
  app.start();

  // The list view, for visitors in a hurry
  topbar.listButton.addEventListener("click", () => {
    scroller.enabled = false;
    list.open();
  });
  list.onClose(() => {
    if (app.isExploring) scroller.enabled = true;
  });
  list.onShowInGarden((id) => void app.visitById(id));

  if (!canHover()) bloomOnView(plots);
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

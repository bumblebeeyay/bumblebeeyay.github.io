import './styles/index.css';

import { Bee } from './bee/Bee';
import { Circling, FollowPointer } from './bee/behaviours';
import { renderBee } from './bee/renderBee';
import { startLoop } from './core/loop';
import { canHover, prefersReducedMotion } from './core/media';
import { vec2 } from './core/vec2';
import rawGarden from './data/garden.json';
import { h } from './dom/create';
import { indexProjects, parseGarden } from './domain/parseGarden';
import { bloomOnView } from './garden/bloomOnView';
import { GardenApp } from './garden/GardenApp';
import { GardenCamera } from './garden/GardenCamera';
import { ProjectDialog } from './garden/ProjectDialog';
import { PointerTracker } from './input/PointerTracker';
import { renderGarden } from './views/garden';

/** Composition root: the only place that knows every piece and wires them together. */
function main(root: HTMLElement): void {
  const content = parseGarden(rawGarden);
  
  const world = renderGarden(content);
  const beeElement = renderBee();
  
  const dialog = new ProjectDialog();
  root.append(world, dialog.element, beeElement);

  const idleSpot = () => vec2(innerWidth * 0.72, innerHeight * 0.3);
  const exploring = new FollowPointer(
    new PointerTracker(window),
    new Circling(idleSpot, { radius: vec2(60, 40), speed: 0.02, periodMs: 8800 }),
  );
  const reading = new Circling(() => dialog.flowerHeadPosition, {
    radius: vec2(50, 16),
    speed: 0.05,
    periodMs: 4400,
  });

  const bee = new Bee(beeElement, idleSpot(), exploring);
  startLoop((dt, time) => bee.update(dt, time));

  new GardenApp({
    world,
    projects: indexProjects(content.areas),
    bee,
    camera: new GardenCamera(world),
    dialog,
    exploring,
    reading,
    reducedMotion: prefersReducedMotion(),
    canHover: canHover(),
  }).start();

  if (!canHover()) bloomOnView(world.querySelectorAll('.plot'));
}

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app element in index.html');

try {
  main(root);
} catch (error) {
  root.replaceChildren(h('p', { class: 'garden-error' }, 'The garden could not grow. 🥀'));
  throw error;
}

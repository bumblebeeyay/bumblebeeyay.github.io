# 🐝 Bumblebee's Garden

An interactive portfolio. Stroll sideways from the hive through a public meadow, a private
greenhouse and a wild corner. Hover a flower and it blooms. Click it and the bee rushes over,
and a herbarium sheet tells you about the project. Visited flowers stay open and fill the honey
jar. After 21:00 (visitor's clock) the garden goes to sleep. "List view" shows everything as a
plain list.

Vite + TypeScript (strict). No framework: the scene is drawn with SVG and CSS.

## Run it

```bash
npm install
npm run dev            # local server with hot reload
npm run check          # lint + formatting + tests with coverage + type-check + build (what CI runs)
npm run build          # production build in dist/
npm test               # unit and integration tests
npm run test:coverage  # the same, with a coverage report (text + coverage/index.html)
npm run format         # format everything with Prettier
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`

## Add a project

Edit `src/data/garden.json`. No code changes needed.

```json
{
  "id": "my-project",
  "title": "My project",
  "summary": "One line, like a plant's common name",
  "description": "What it is, what I built, what I learned.",
  "tags": ["TypeScript", "Vite"],
  "links": [{ "label": "View code", "href": "https://github.com/…" }],
  "flower": {
    "shape": "cosmos",
    "petal": "#ef5a6f",
    "outline": "#c63d52",
    "core": "#f7c948"
  }
}
```

`tags` and `links` are optional. Links become seed packets on the project page.

Each area has a `setting` that decides how it is drawn: `meadow`, `greenhouse` (fogged glass
the visitor wipes clear) or `wild`. Its `tagline` goes on the signpost, and an optional `note`
on a small hanging sign.

The content is checked when the page loads. A mistake gives a clear error such as
`garden.json › areas[0].projects[2].flower.shape: expected one of daisy, cosmos, lotus, tulip`.

Ids are slugs (`my-project`: lowercase letters, digits, single hyphens) and must be unique
across areas and projects. Area ids become element ids, so a few names the page already
uses (such as `hive`) are reserved.

## Architecture

```
src/
├── main.ts              composition root: builds every piece and wires them together
├── data/garden.json     all content
├── domain/              content types, runtime validation of the JSON, the project index
├── util/                pure helpers (no browser APIs): vectors, easing, seeded random, clock
├── dom/                 browser-facing helpers: element builders (no innerHTML), geometry,
│                        transitions, animation loop, media queries
├── flower/              petal shapes registry + flower SVG renderer
├── bee/                 Bee entity + interchangeable flight behaviours
├── input/               pointer tracking
├── world/               horizontal scrolling (wheel, drag, keys) and the parallax position
├── views/               pure render functions: content in, DOM out; the page's ids
│                        (ids.ts) and go-to links (navigation.ts)
├── garden/              interaction: visit flow, camera, herbarium and list dialogs,
│                        go-to navigation, greenhouse fog, night mode, visited flowers
├── test/                shared test fixtures
└── styles/              one stylesheet per component; day/night colors in tokens.css
```

Some choices:

- **Bee behaviours use the strategy pattern.** `Bee` only knows the `BeeBehaviour` interface
  (`targetAt(time)`, `speed`, `bobs`). Following the pointer, circling, and rushing to a flower
  are separate classes, so a new way of flying never touches `Bee`.
- **Flower shapes are a registry.** A new shape is one entry in `PETAL_SHAPES` plus its id.
  The renderer and the CSS stay as they are.
- **Dependencies are injected.** `GardenApp` gets the bee, camera, dialog and behaviours through
  its constructor and only owns the order of a visit (bloom → fly → zoom → open) and its state.
  `main.ts` is the only file that knows about every module.
- **Views are pure functions** that turn content into DOM. Text is always inserted as text
  nodes, and links are checked when the JSON is parsed, so content cannot inject markup or
  `javascript:` URLs.
- **Motion is frame-rate independent.** Easing is exponential and scaled by the frame time,
  so the bee feels the same at 60 Hz and 144 Hz. This is covered by tests.
- **Parallax in CSS.** `WorldScroller` publishes the scroll position once per frame as
  `--scroll-x`; each layer (hills, clouds, grass) moves its mask by its own factor.
  Night mode only swaps color tokens: every color lives in `tokens.css`, except shadows,
  faint textures and mask pixels.
- **Fonts are bundled** (Fontsource), not loaded from Google Fonts: no third-party request.
- **Accessibility.** Plots are real buttons (keyboard focus also makes a flower bloom). The
  project view is a `<dialog>`, and the garden behind it is made `inert`. Escape closes it,
  ←/→ flip sheets, and focus goes back to the flower. Arrow keys, Page Up/Down, Home and End
  walk the garden. `prefers-reduced-motion` is respected. On touch screens, flowers bloom
  when they scroll into view. Visits are kept in `localStorage` when it is available.

## Tests

Vitest runs in [happy-dom](https://github.com/capricorn86/happy-dom), a light DOM, so views and
controllers can be tested without a browser.

- **Unit tests** (`*.test.ts` next to each module): pure helpers, the JSON parser, bee
  behaviours, views, and each controller on its own.
- **Integration tests** (`*.integration.test.ts`): the real garden DOM wired to `GardenApp`,
  the herbarium and list dialogs, the camera, the scroller and visits, as in `main.ts`.

happy-dom has no layout: positions are zero and CSS transitions never end on their own, so
tests mock sizes where they matter and fire `transitionend` by hand. `main.ts` is left out of
coverage: it only wires pieces together, and is best checked end to end in a real browser.

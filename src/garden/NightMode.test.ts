import { afterEach, describe, expect, it, vi } from "vitest";
import { NightMode, syncThemeColor } from "./NightMode";

describe("NightMode", () => {
  const started = (night: boolean) => {
    const root = document.createElement("html");
    const mode = new NightMode(night, root);
    mode.start();
    return { root, mode };
  };

  it("touches nothing until started", () => {
    const root = document.createElement("html");
    new NightMode(true, root);
    expect(root.dataset.theme).toBeUndefined();
  });

  it("shows the starting theme on the root element", () => {
    expect(started(true).root.dataset.theme).toBe("night");
  });

  it("toggles between day and night", () => {
    const { root, mode } = started(false);
    mode.toggle();
    expect(mode.night.value).toBe(true);
    expect(root.dataset.theme).toBe("night");
    mode.toggle();
    expect(root.dataset.theme).toBe("day");
  });

  it("tells followers now, then after every switch", () => {
    const { mode } = started(false);
    const listener = vi.fn();
    mode.night.subscribe(listener);
    mode.toggle();
    expect(listener.mock.calls).toEqual([[false], [true]]);
  });

  it("leaves the page alone once destroyed", () => {
    const { root, mode } = started(false);
    mode.destroy();
    mode.toggle();
    expect(root.dataset.theme).toBe("day");
  });
});

describe("syncThemeColor", () => {
  afterEach(() => {
    document.head.replaceChildren();
    document.documentElement.style.removeProperty("--sky-mid");
  });

  it("tints the browser with the current sky color", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#ffffff";
    document.head.append(meta);
    document.documentElement.style.setProperty("--sky-mid", "#25336a");

    syncThemeColor();

    expect(meta.content).toBe("#25336a");
  });

  it("leaves the page alone without a theme-color tag", () => {
    expect(() => syncThemeColor()).not.toThrow();
  });
});

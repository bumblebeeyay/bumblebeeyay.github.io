import { describe, expect, it, vi } from "vitest";
import { NightMode, syncThemeColor } from "./NightMode";

describe("NightMode", () => {
  it("shows the starting theme on the root element", () => {
    const root = document.createElement("html");
    new NightMode(true, root);
    expect(root.dataset.theme).toBe("night");
  });

  it("toggles between day and night", () => {
    const root = document.createElement("html");
    const night = new NightMode(false, root);
    night.toggle();
    expect(night.isNight).toBe(true);
    expect(root.dataset.theme).toBe("night");
    night.toggle();
    expect(root.dataset.theme).toBe("day");
  });

  it("tells subscribers now, then after every switch", () => {
    const night = new NightMode(false, document.createElement("html"));
    const listener = vi.fn();
    night.subscribe(listener);
    night.toggle();
    expect(listener.mock.calls).toEqual([[false], [true]]);
  });
});

describe("syncThemeColor", () => {
  it("tints the browser with the current sky color", () => {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#ffffff";
    document.head.append(meta);
    document.documentElement.style.setProperty("--sky-mid", "#25336a");

    syncThemeColor();

    expect(meta.content).toBe("#25336a");
    meta.remove();
    document.documentElement.style.removeProperty("--sky-mid");
  });

  it("leaves the page alone without a theme-color tag", () => {
    expect(() => syncThemeColor()).not.toThrow();
  });
});

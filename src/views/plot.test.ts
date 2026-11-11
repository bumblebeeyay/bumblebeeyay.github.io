import { describe, expect, it } from "vitest";
import { makeProject } from "../test/fixtures";
import {
  PLOT_SELECTOR,
  PROJECT_ID_ATTRIBUTE,
  plotLabel,
  renderPlot,
  setPlotVisited,
} from "./plot";

describe("plotLabel", () => {
  const project = makeProject("a", { title: "Daisy" });

  it("names the project and what the button does", () => {
    expect(plotLabel(project, false)).toBe("Daisy: open the project page");
  });

  it("says when the flower was visited", () => {
    expect(plotLabel(project, true)).toBe(
      "Daisy, visited: open the project page",
    );
  });
});

describe("renderPlot", () => {
  it("is one button that knows its project", () => {
    const plot = renderPlot(makeProject("a", { title: "Daisy" }));
    expect(plot.tagName).toBe("BUTTON");
    expect(plot.matches(PLOT_SELECTOR)).toBe(true);
    expect(plot.getAttribute(PROJECT_ID_ATTRIBUTE)).toBe("a");
    expect(plot.getAttribute("aria-label")).toBe(
      plotLabel(makeProject("a", { title: "Daisy" }), false),
    );
  });

  it("gives each flower its own, stable height", () => {
    const growth = (id: string) =>
      renderPlot(makeProject(id)).style.getPropertyValue("--growth");
    expect(growth("a")).toBe(growth("a"));
    const value = Number(growth("a"));
    expect(value).toBeGreaterThanOrEqual(0.92);
    expect(value).toBeLessThan(0.92 + 100 / 400);
  });
});

describe("setPlotVisited", () => {
  it("marks the plot and updates its label, both ways", () => {
    const project = makeProject("a", { title: "Daisy" });
    const plot = renderPlot(project);

    setPlotVisited(plot, project, true);
    expect(plot.classList.contains("is-visited")).toBe(true);
    expect(plot.getAttribute("aria-label")).toBe(plotLabel(project, true));

    setPlotVisited(plot, project, false);
    expect(plot.classList.contains("is-visited")).toBe(false);
    expect(plot.getAttribute("aria-label")).toBe(plotLabel(project, false));
  });
});

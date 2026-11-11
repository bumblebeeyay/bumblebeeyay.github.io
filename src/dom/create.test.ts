import { describe, expect, it } from "vitest";
import { h, svg } from "./create";

describe("h", () => {
  it("sets attributes, with true as an empty attribute and false/null/undefined skipped", () => {
    const button = h("button", {
      type: "button",
      tabindex: 0,
      disabled: true,
      hidden: false,
      title: null,
      lang: undefined,
    });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("tabindex")).toBe("0");
    expect(button.getAttribute("disabled")).toBe("");
    expect(button.hasAttribute("hidden")).toBe(false);
    expect(button.hasAttribute("title")).toBe(false);
    expect(button.hasAttribute("lang")).toBe(false);
  });

  it("appends children and skips empty ones", () => {
    const list = h("ul", {}, h("li"), null, undefined, false, "text", 3);
    expect(list.childNodes).toHaveLength(3);
    expect(list.textContent).toBe("text3");
  });

  it("inserts strings as text, never as markup", () => {
    const p = h("p", {}, '<img src=x onerror="alert(1)">');
    expect(p.children).toHaveLength(0);
    expect(p.textContent).toBe('<img src=x onerror="alert(1)">');
  });
});

describe("svg", () => {
  it("creates elements in the SVG namespace", () => {
    const circle = svg("circle", { r: 4 });
    expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(circle.getAttribute("r")).toBe("4");
  });
});

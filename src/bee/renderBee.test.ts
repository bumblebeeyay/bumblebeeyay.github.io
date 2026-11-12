import { describe, expect, it } from "vitest";
import { renderBee } from "./renderBee";

describe("renderBee", () => {
  const bee = renderBee();

  it("is hidden from assistive technology: it is decoration", () => {
    expect(bee.getAttribute("aria-hidden")).toBe("true");
  });

  it("carries its night lantern, shown by CSS only at night", () => {
    expect(bee.querySelector(".bee__lantern")).not.toBeNull();
    expect(bee.querySelectorAll(".bee__wing")).toHaveLength(2);
  });
});

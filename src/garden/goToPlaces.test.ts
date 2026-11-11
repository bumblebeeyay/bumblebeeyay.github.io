import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "../dom/create";
import { goTo } from "../views/navigation";
import { followGoToLinks } from "./goToPlaces";

describe("followGoToLinks", () => {
  const place = h("section", { id: "meadow" });
  const button = h("button", goTo("meadow"), h("span", {}, "Meadow"));
  const nowhere = h("button", goTo("missing"));
  const root = h("div", {}, place, button, nowhere);
  document.body.append(root);

  let stop = (): void => undefined;
  afterEach(() => stop());

  const setUp = (canMove = true) => {
    const scroller = { scrollToElement: vi.fn() };
    stop = followGoToLinks(document, scroller, () => canMove);
    return scroller;
  };

  it("walks to the place a control points at", () => {
    const scroller = setUp();
    button.firstElementChild?.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    );
    expect(scroller.scrollToElement).toHaveBeenCalledWith(place);
  });

  it("stays put while the walk is frozen", () => {
    const scroller = setUp(false);
    button.click();
    expect(scroller.scrollToElement).not.toHaveBeenCalled();
  });

  it("ignores places that do not exist and other clicks", () => {
    const scroller = setUp();
    nowhere.click();
    place.click();
    expect(scroller.scrollToElement).not.toHaveBeenCalled();
  });

  it("stops listening when asked", () => {
    const scroller = setUp();
    stop();
    button.click();
    expect(scroller.scrollToElement).not.toHaveBeenCalled();
  });
});

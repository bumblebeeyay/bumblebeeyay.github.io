import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeArea, makeProject } from "../test/fixtures";
import { ListDialog } from "./ListDialog";

/** Generous wait: under a loaded machine (CI, a full parallel run) a frame can take long. */
const SLOW_MACHINE = { timeout: 5_000 };

describe("ListDialog", () => {
  let list: ListDialog;

  beforeEach(() => {
    document.body.replaceChildren();
    list = new ListDialog([
      makeArea("meadow", [makeProject("a"), makeProject("b")]),
    ]);
    document.body.append(list.element);
    list.start();
    list.open();
  });

  afterEach(() => list.destroy());

  const showButton = (index: number) =>
    list.element.querySelectorAll<HTMLButtonElement>(".list-dialog__show")[
      index
    ];

  it("opens as a modal dialog", () => {
    expect(list.element.open).toBe(true);
  });

  it("closes, then asks to show the chosen project in the garden", () => {
    const onShow = vi.fn();
    list.showRequested.subscribe(onShow);
    showButton(1)?.click();
    expect(list.element.open).toBe(false);
    expect(onShow).toHaveBeenCalledWith("b");
  });

  it("closes from its close button and from the backdrop", () => {
    list.element
      .querySelector<HTMLButtonElement>(".list-dialog__close")
      ?.click();
    expect(list.element.open).toBe(false);

    list.open();
    list.element.click();
    expect(list.element.open).toBe(false);
  });

  it("tells when it closes", async () => {
    const onClose = vi.fn();
    list.closed.subscribe(onClose);
    list.element.close();
    await vi.waitFor(
      () => expect(onClose).toHaveBeenCalledOnce(),
      SLOW_MACHINE,
    );
  });

  it("ignores clicks on the list that are not on a button", () => {
    const onShow = vi.fn();
    list.showRequested.subscribe(onShow);
    list.element.querySelector("li")?.click();
    expect(list.element.open).toBe(true);
    expect(onShow).not.toHaveBeenCalled();
  });

  it("stops reacting once destroyed", () => {
    const onShow = vi.fn();
    list.showRequested.subscribe(onShow);
    list.destroy();
    showButton(0)?.click();
    expect(onShow).not.toHaveBeenCalled();
    expect(list.element.open).toBe(true);
  });
});

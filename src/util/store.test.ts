import { describe, expect, it, vi } from "vitest";
import { Store } from "./store";

describe("Store", () => {
  it("holds a value", () => {
    const store = new Store(1);
    store.set(2);
    expect(store.value).toBe(2);
  });

  it("tells a listener the current value at once, then every change", () => {
    const store = new Store("day");
    const listener = vi.fn();
    store.subscribe(listener);
    store.set("night");
    expect(listener.mock.calls).toEqual([["day"], ["night"]]);
  });

  it("stays quiet when set to the same value", () => {
    const store = new Store(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(1);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("stops telling a listener once unsubscribed or aborted", () => {
    const store = new Store(0);
    const byFunction = vi.fn();
    const bySignal = vi.fn();
    const lifetime = new AbortController();
    store.subscribe(byFunction)();
    store.subscribe(bySignal, { signal: lifetime.signal });
    lifetime.abort();
    store.set(1);
    expect(byFunction).toHaveBeenCalledOnce();
    expect(bySignal).toHaveBeenCalledOnce();
  });

  it("does not even call a listener whose signal is already aborted", () => {
    const listener = vi.fn();
    new Store(0).subscribe(listener, { signal: AbortSignal.abort() });
    expect(listener).not.toHaveBeenCalled();
  });
});

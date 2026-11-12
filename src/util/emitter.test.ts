import { describe, expect, it, vi } from "vitest";
import { Emitter } from "./emitter";

describe("Emitter", () => {
  it("calls every listener with the value", () => {
    const emitter = new Emitter<number>();
    const a = vi.fn();
    const b = vi.fn();
    emitter.subscribe(a);
    emitter.subscribe(b);
    emitter.emit(3);
    expect(a).toHaveBeenCalledWith(3);
    expect(b).toHaveBeenCalledWith(3);
  });

  it("does not replay past events to new listeners", () => {
    const emitter = new Emitter();
    emitter.emit();
    const listener = vi.fn();
    emitter.subscribe(listener);
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribes one listener with the returned function", () => {
    const emitter = new Emitter();
    const kept = vi.fn();
    const dropped = vi.fn();
    emitter.subscribe(kept);
    const unsubscribe = emitter.subscribe(dropped);
    unsubscribe();
    emitter.emit();
    expect(kept).toHaveBeenCalledOnce();
    expect(dropped).not.toHaveBeenCalled();
  });

  it("unsubscribes when the signal aborts, and ignores an already aborted one", () => {
    const emitter = new Emitter();
    const listener = vi.fn();
    const lifetime = new AbortController();
    emitter.subscribe(listener, { signal: lifetime.signal });
    lifetime.abort();
    emitter.subscribe(listener, { signal: lifetime.signal });
    emitter.emit();
    expect(listener).not.toHaveBeenCalled();
  });

  it("counts the same function subscribed twice as two subscriptions", () => {
    const emitter = new Emitter();
    const listener = vi.fn();
    const first = emitter.subscribe(listener);
    emitter.subscribe(listener);
    first();
    emitter.emit();
    expect(listener).toHaveBeenCalledOnce();
  });

  it("lets a listener unsubscribe while being called", () => {
    const emitter = new Emitter();
    const after = vi.fn();
    const unsubscribe = emitter.subscribe(() => unsubscribe());
    emitter.subscribe(after);
    emitter.emit();
    emitter.emit();
    expect(after).toHaveBeenCalledTimes(2);
  });
});

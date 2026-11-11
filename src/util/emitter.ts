export type Listener<T> = (value: T) => void;
export type Unsubscribe = () => void;

export interface SubscribeOptions {
  /** Unsubscribes when this signal aborts, like `addEventListener`'s `signal`. */
  readonly signal?: AbortSignal;
}

/** Something that can be listened to, but not triggered from outside. */
export interface Subscribable<T> {
  subscribe(listener: Listener<T>, options?: SubscribeOptions): Unsubscribe;
}

/**
 * Events: "something happened", with no current value to read.
 * Any number of listeners; each subscription can be undone on its own,
 * by the returned function or by an abort signal.
 *
 * The owner keeps the emitter private and exposes it as a `Subscribable`,
 * so only the owner can emit.
 */
export class Emitter<T = void> implements Subscribable<T> {
  readonly #listeners = new Set<Listener<T>>();

  subscribe(
    listener: Listener<T>,
    { signal }: SubscribeOptions = {},
  ): Unsubscribe {
    if (signal?.aborted) return () => undefined;
    // Wrapped, so the same function subscribed twice really listens twice.
    const entry: Listener<T> = (value) => listener(value);
    this.#listeners.add(entry);
    const unsubscribe = (): void => {
      this.#listeners.delete(entry);
    };
    signal?.addEventListener("abort", unsubscribe, { once: true });
    return unsubscribe;
  }

  emit(value: T): void {
    // A copy, so listeners may unsubscribe (or subscribe) while being called.
    for (const listener of [...this.#listeners]) listener(value);
  }
}

import {
  Emitter,
  type Listener,
  type Subscribable,
  type SubscribeOptions,
  type Unsubscribe,
} from "./emitter";

/** A state others can read and follow, but not change. */
export interface ReadonlyStore<T> extends Subscribable<T> {
  readonly value: T;
}

/**
 * State: a current value, and listeners told right away, then on every change.
 * Setting the same value again (by `Object.is`) tells no one, so values should be
 * replaced, not mutated: a new `Set` rather than `set.add`.
 *
 * The owner keeps the store private and exposes it as a `ReadonlyStore`.
 */
export class Store<T> implements ReadonlyStore<T> {
  readonly #changed = new Emitter<T>();
  #value: T;

  constructor(initial: T) {
    this.#value = initial;
  }

  get value(): T {
    return this.#value;
  }

  set(value: T): void {
    if (Object.is(value, this.#value)) return;
    this.#value = value;
    this.#changed.emit(value);
  }

  /** Calls `listener` with the current value now, then after every change. */
  subscribe(listener: Listener<T>, options?: SubscribeOptions): Unsubscribe {
    if (options?.signal?.aborted) return () => undefined;
    const unsubscribe = this.#changed.subscribe(listener, options);
    listener(this.#value);
    return unsubscribe;
  }
}

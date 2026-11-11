/**
 * The one contract every interactive piece of the page follows:
 *
 * - the constructor only builds (DOM, state): no listener, no timer, no side effect;
 * - `start()` wires everything up, passing the given signal to every listener
 *   (`addEventListener(…, { signal })`, `subscribe(…, { signal })`);
 * - `destroy()` aborts that signal, which unwires everything at once.
 *
 * So nothing can be forgotten when tearing down, and a piece can be built in a test
 * without touching the page. Views stay pure functions and never listen to anything.
 */
export abstract class Controller {
  #lifetime: AbortController | null = null;

  get isStarted(): boolean {
    return this.#lifetime !== null;
  }

  /** Wires the controller up. Does nothing if it is already started. */
  start(): void {
    if (this.#lifetime) return;
    this.#lifetime = new AbortController();
    this.connect(this.#lifetime.signal);
  }

  /** Removes every listener and timer added by `connect`. It can be started again after. */
  destroy(): void {
    this.#lifetime?.abort();
    this.#lifetime = null;
  }

  /**
   * Adds listeners, subscriptions and timers, all tied to `signal`.
   * For something that takes no signal (an observer, an animation frame),
   * clean it up in `signal.addEventListener("abort", …)`.
   */
  protected abstract connect(signal: AbortSignal): void;
}

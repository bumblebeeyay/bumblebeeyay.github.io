import { Store, type ReadonlyStore } from "../util/store";

const STORAGE_KEY = "bees-garden:visited";

/** Minimal storage, so tests can pass a fake. */
export type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

/**
 * Remembers which projects the visitor has opened, across page loads when storage works.
 * Storage can be missing or throw (private windows, blocked cookies): the garden still works,
 * it just forgets on reload.
 */
export class VisitedProjects {
  readonly #ids: Store<ReadonlySet<string>>;
  /** The visited project ids. Follow it to redraw plots and the honey jar. */
  readonly ids: ReadonlyStore<ReadonlySet<string>>;

  constructor(
    private readonly knownIds: ReadonlySet<string>,
    private readonly store: KeyValueStore | null = safeLocalStorage(),
  ) {
    this.#ids = new Store<ReadonlySet<string>>(
      new Set(this.#load().filter((id) => knownIds.has(id))),
    );
    this.ids = this.#ids;
  }

  get total(): number {
    return this.knownIds.size;
  }

  add(id: string): void {
    const ids = this.#ids.value;
    if (!this.knownIds.has(id) || ids.has(id)) return;
    // A new set, not a mutated one: the store only tells listeners about new values.
    const next = new Set(ids).add(id);
    this.#save(next);
    this.#ids.set(next);
  }

  #load(): string[] {
    try {
      const parsed: unknown = JSON.parse(
        this.store?.getItem(STORAGE_KEY) ?? "[]",
      );
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  }

  #save(ids: ReadonlySet<string>): void {
    try {
      this.store?.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
      // Storage full or blocked: keep the visit in memory only.
    }
  }
}

function safeLocalStorage(): KeyValueStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

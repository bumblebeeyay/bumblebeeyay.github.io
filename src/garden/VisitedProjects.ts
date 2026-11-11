const STORAGE_KEY = "bees-garden:visited";

/** Minimal storage, so tests can pass a fake. */
export type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

type Listener = (visited: ReadonlySet<string>) => void;

/**
 * Remembers which projects the visitor has opened, across page loads when storage works.
 * Storage can be missing or throw (private windows, blocked cookies): the garden still works,
 * it just forgets on reload.
 */
export class VisitedProjects {
  readonly #ids: Set<string>;
  readonly #listeners: Listener[] = [];

  constructor(
    private readonly knownIds: ReadonlySet<string>,
    private readonly store: KeyValueStore | null = safeLocalStorage(),
  ) {
    this.#ids = new Set(this.#load().filter((id) => knownIds.has(id)));
  }

  get ids(): ReadonlySet<string> {
    return this.#ids;
  }

  get total(): number {
    return this.knownIds.size;
  }

  has(id: string): boolean {
    return this.#ids.has(id);
  }

  add(id: string): void {
    if (!this.knownIds.has(id) || this.#ids.has(id)) return;
    this.#ids.add(id);
    this.#save();
    for (const listener of this.#listeners) listener(this.#ids);
  }

  /** Calls `listener` now and after every change. */
  subscribe(listener: Listener): void {
    this.#listeners.push(listener);
    listener(this.#ids);
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

  #save(): void {
    try {
      this.store?.setItem(STORAGE_KEY, JSON.stringify([...this.#ids]));
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

import { useEffect, useSyncExternalStore } from 'react';

import type { Catalog, DocRepo, NewRecord, Repo } from '@/services/types';
import type { BaseRecord } from '@/types';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type Listener = () => void;

function emitter<S>(initial: S) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(next: Partial<S>) {
      state = { ...state, ...next };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Collapses repeated calls with the same key into one in-flight promise,
 * so a double tap on "Save" never creates two entries.
 */
function singleFlight() {
  const inflight = new Map<string, Promise<unknown>>();
  return function run<R>(key: string, task: () => Promise<R>): Promise<R> {
    const existing = inflight.get(key);
    if (existing) return existing as Promise<R>;
    const promise = task().finally(() => inflight.delete(key));
    inflight.set(key, promise);
    return promise;
  };
}

/* ── Collections ───────────────────────────────────────────── */

export interface CollectionState<T> {
  items: T[];
  status: LoadStatus;
  error?: string;
  /** Keys of mutations currently running, e.g. `create` or `update:abc`. */
  busy: string[];
}

export function createCollection<T extends BaseRecord>(repo: Repo<T>, sort?: (a: T, b: T) => number, afterChange?: () => void) {
  const store = emitter<CollectionState<T>>({ items: [], status: 'idle', busy: [] });
  const run = singleFlight();
  const ordered = (items: T[]) => (sort ? [...items].sort(sort) : items);

  const track = <R>(key: string, task: () => Promise<R>) =>
    run(key, async () => {
      store.set({ busy: [...store.get().busy, key] });
      try {
        return await task();
      } finally {
        store.set({ busy: store.get().busy.filter((k) => k !== key) });
      }
    });

  return {
    ...store,
    load(force = false) {
      const { status } = store.get();
      if (!force && (status === 'loading' || status === 'ready')) return Promise.resolve();
      return run('load', async () => {
        store.set({ status: 'loading', error: undefined });
        try {
          store.set({ items: ordered(await repo.list()), status: 'ready' });
        } catch (error) {
          store.set({ status: 'error', error: messageOf(error) });
        }
      });
    },
    create(input: NewRecord<T>, key = 'create') {
      return track(key, async () => {
        const record = await repo.create(input);
        store.set({ items: ordered([record, ...store.get().items]) });
        afterChange?.();
        return record;
      });
    },
    update(id: string, patch: Partial<NewRecord<T>>) {
      return track(`update:${id}`, async () => {
        // Send the merged record so adapters can map whole entries (e.g. a feeding's kind).
        const current = store.get().items.find((item) => item.id === id);
        const { id: _id, origin: _origin, ...rest } = (current ?? {}) as T;
        void _id;
        void _origin;
        const record = await repo.update(id, { ...(rest as unknown as Partial<NewRecord<T>>), ...patch });
        store.set({ items: ordered(store.get().items.map((item) => (item.id === id ? record : item))) });
        afterChange?.();
        return record;
      });
    },
    remove(id: string) {
      return track(`remove:${id}`, async () => {
        await repo.remove(id);
        store.set({ items: store.get().items.filter((item) => item.id !== id) });
        afterChange?.();
      });
    },
    reset() {
      store.set({ items: [], status: 'idle', error: undefined, busy: [] });
    },
  };
}

export type Collection<T extends BaseRecord> = ReturnType<typeof createCollection<T>>;

export function useCollection<T extends BaseRecord>(collection: Collection<T>) {
  const state = useSyncExternalStore(collection.subscribe, collection.get, collection.get);
  useEffect(() => {
    collection.load();
  }, [collection]);
  return {
    ...state,
    isBusy: (key: string) => state.busy.includes(key),
    retry: () => collection.load(true),
    create: collection.create,
    update: collection.update,
    remove: collection.remove,
  };
}

/* ── Catalogs (read-only) ──────────────────────────────────── */

export interface CatalogState<T> {
  items: T[];
  status: LoadStatus;
  error?: string;
}

export function createCatalog<T>(catalog: Catalog<T>) {
  const store = emitter<CatalogState<T>>({ items: [], status: 'idle' });
  const run = singleFlight();
  return {
    ...store,
    /** Put a record the server just returned into the list without refetching. */
    upsert(item: T & { id: string }, first = true) {
      const items = store.get().items as (T & { id: string })[];
      const exists = items.some((x) => x.id === item.id);
      store.set({ items: exists ? items.map((x) => (x.id === item.id ? item : x)) : first ? [item, ...items] : [...items, item] });
    },
    load(force = false) {
      const { status } = store.get();
      if (!force && (status === 'loading' || status === 'ready')) return Promise.resolve();
      return run('load', async () => {
        store.set({ status: 'loading', error: undefined });
        try {
          store.set({ items: await catalog.list(), status: 'ready' });
        } catch (error) {
          store.set({ status: 'error', error: messageOf(error) });
        }
      });
    },
  };
}

export type CatalogStore<T> = ReturnType<typeof createCatalog<T>>;

export function useCatalog<T>(catalog: CatalogStore<T>) {
  const state = useSyncExternalStore(catalog.subscribe, catalog.get, catalog.get);
  useEffect(() => {
    catalog.load();
  }, [catalog]);
  return { ...state, retry: () => catalog.load(true), upsert: catalog.upsert };
}

/* ── Single documents ──────────────────────────────────────── */

export interface DocState<T> {
  value: T | null;
  status: LoadStatus;
  error?: string;
  saving: boolean;
}

export function createDoc<T>(repo: DocRepo<T>) {
  const store = emitter<DocState<T>>({ value: null, status: 'idle', saving: false });
  const run = singleFlight();
  return {
    ...store,
    load(force = false) {
      const { status } = store.get();
      if (!force && (status === 'loading' || status === 'ready')) return Promise.resolve();
      return run('load', async () => {
        store.set({ status: 'loading', error: undefined });
        try {
          store.set({ value: await repo.get(), status: 'ready' });
        } catch (error) {
          store.set({ status: 'error', error: messageOf(error) });
        }
      });
    },
    save(value: T) {
      return run('save', async () => {
        store.set({ saving: true });
        try {
          const saved = await repo.save(value);
          store.set({ value: saved });
          return saved;
        } finally {
          store.set({ saving: false });
        }
      });
    },
  };
}

export type DocStore<T> = ReturnType<typeof createDoc<T>>;

export function useDoc<T>(doc: DocStore<T>) {
  const state = useSyncExternalStore(doc.subscribe, doc.get, doc.get);
  useEffect(() => {
    doc.load();
  }, [doc]);
  return { ...state, save: doc.save, retry: () => doc.load(true) };
}

export function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

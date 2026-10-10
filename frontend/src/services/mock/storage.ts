import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BaseRecord } from '@/types';
import type { Catalog, DocRepo, NewRecord, Repo } from '../types';

const PREFIX = 'nurture:demo:v2:';

/** Demo-only switches, exposed in Settings → Demo tools so error states can be shown. */
export const demoFlags = { failNextRequest: false };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function simulateNetwork() {
  await wait(120 + Math.random() * 160);
  if (demoFlags.failNextRequest) {
    demoFlags.failNextRequest = false;
    throw new Error('The demo connection dropped. Nothing was lost — try again.');
  }
}

const cacheResets = new Set<() => void>();

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function write<T>(key: string, value: T) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private browsing). The in-memory copy still works.
  }
}

/** A collection kept on this device, seeded with sample records on first run. */
export function localRepo<T extends BaseRecord>(key: string, seed: () => T[]): Repo<T> {
  let cache: T[] | null = null;
  cacheResets.add(() => (cache = null));

  async function all(): Promise<T[]> {
    if (cache) return cache;
    const stored = await read<T[]>(key);
    cache = stored ?? seed();
    if (!stored) await write(key, cache);
    return cache;
  }

  async function commit(next: T[]) {
    cache = next;
    await write(key, next);
  }

  return {
    async list() {
      await simulateNetwork();
      return [...(await all())];
    },
    async create(input: NewRecord<T>) {
      await simulateNetwork();
      const record = { ...input, id: newId(), origin: 'demo' } as unknown as T;
      await commit([record, ...(await all())]);
      return record;
    },
    async update(id, patch) {
      await simulateNetwork();
      const items = await all();
      const current = items.find((item) => item.id === id);
      if (!current) throw new Error('That entry no longer exists.');
      const next = { ...current, ...patch } as T;
      await commit(items.map((item) => (item.id === id ? next : item)));
      return next;
    },
    async remove(id) {
      await simulateNetwork();
      await commit((await all()).filter((item) => item.id !== id));
    },
  };
}

export function localCatalog<T>(items: () => T[]): Catalog<T> {
  return {
    async list() {
      await simulateNetwork();
      return items();
    },
  };
}

export function localDoc<T>(key: string, seed: () => T): DocRepo<T> {
  let cache: T | null = null;
  cacheResets.add(() => (cache = null));
  return {
    async get() {
      await simulateNetwork();
      if (!cache) cache = (await read<T>(key)) ?? seed();
      return cache;
    },
    async save(value) {
      await simulateNetwork();
      cache = value;
      await write(key, value);
      return value;
    },
  };
}

/** Clears every demo record so the seeded sample data is restored on next load. */
export async function resetDemoData() {
  cacheResets.forEach((reset) => reset());
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith(PREFIX)));
  } catch {
    // ignore
  }
}

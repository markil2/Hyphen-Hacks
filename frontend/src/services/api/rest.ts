import type { BaseRecord } from '@/types';
import type { Catalog, DocRepo, NewRecord, Repo } from '../types';

/**
 * REST adapters used when EXPO_PUBLIC_API_URL is set.
 *
 * These paths and payloads are a *proposal* for the backend teammate — see
 * docs/BACKEND_INTEGRATION.md. Nothing here is a confirmed contract yet.
 */

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base.replace(/\/$/, '')}/${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    throw new Error(`The server answered ${response.status}. Please try again.`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const tag = <T>(record: T) => ({ ...record, origin: 'api' as const });

export function restRepo<T extends BaseRecord>(base: string, resource: string): Repo<T> {
  return {
    async list() {
      return (await request<T[]>(base, resource)).map(tag);
    },
    async create(input: NewRecord<T>) {
      return tag(await request<T>(base, resource, { method: 'POST', body: JSON.stringify(input) }));
    },
    async update(id, patch) {
      return tag(
        await request<T>(base, `${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
      );
    },
    async remove(id) {
      await request<void>(base, `${resource}/${id}`, { method: 'DELETE' });
    },
  };
}

export function restCatalog<T>(base: string, resource: string): Catalog<T> {
  return {
    async list() {
      return (await request<T[]>(base, resource)).map(tag) as T[];
    },
  };
}

export function restDoc<T>(base: string, resource: string): DocRepo<T> {
  return {
    async get() {
      return tag(await request<T>(base, resource)) as T;
    },
    async save(value) {
      return tag(await request<T>(base, resource, { method: 'PUT', body: JSON.stringify(value) })) as T;
    },
  };
}

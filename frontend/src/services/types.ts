import type { BaseRecord } from '@/types';

/** Omit that distributes over unions, so `NewRecord<FeedingEntry>` keeps each variant. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type NewRecord<T extends BaseRecord> = DistributiveOmit<T, 'id' | 'origin'>;

/** A user-owned collection: logs, questions, saved items. */
export interface Repo<T extends BaseRecord> {
  list(): Promise<T[]>;
  create(input: NewRecord<T>): Promise<T>;
  update(id: string, patch: Partial<NewRecord<T>>): Promise<T>;
  remove(id: string): Promise<void>;
}

/** Read-only reference content: products, experts, milestones. */
export interface Catalog<T> {
  list(): Promise<T[]>;
}

/** A single document, such as the family profile. */
export interface DocRepo<T> {
  get(): Promise<T>;
  save(value: T): Promise<T>;
}

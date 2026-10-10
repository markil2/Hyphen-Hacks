import { local, remote } from '@/services';
import { resetDemoData } from '@/services/mock/storage';
import type { BaseRecord } from '@/types';

import { createCatalog, createCollection, createDoc } from './store';

const newestBy =
  <T extends BaseRecord>(field: (item: T) => string) =>
  (a: T, b: T) =>
    field(b).localeCompare(field(a));

const readOnly = <T>(get: () => Promise<T>) => ({
  get,
  save: async (): Promise<T> => {
    throw new Error('Read-only');
  },
});

const afterCare = () => refreshSummaries();

/** App-wide stores. Screens subscribe with useCollection / useCatalog / useDoc. */
export const stores = {
  // From the Nurture backend (or the offline demo when no API URL is set)
  baby: createDoc(remote.baby),
  account: createDoc(readOnly(remote.account.get)),
  dashboard: createDoc(readOnly(remote.dashboard.summary)),
  timeline: createDoc(readOnly(remote.dashboard.timeline)),
  sleep: createCollection(remote.sleep, newestBy((s) => s.startedAt), afterCare),
  feedings: createCollection(remote.feedings, newestBy((f) => f.at), afterCare),
  diapers: createCollection(remote.diapers, newestBy((d) => d.at), afterCare),
  heights: createCollection(remote.heights, newestBy((h) => h.measuredAt), afterCare),
  milestones: createCollection(remote.milestones, newestBy((m) => m.achievedAt), afterCare),
  questions: createCatalog(remote.questions),
  consultations: createCatalog(remote.consultations),
  experts: createCatalog(remote.experts),
  products: createCatalog(remote.products),
  resources: createCatalog(remote.resources),

  // Device-only
  preferences: createDoc(local.preferences),
  saved: createCollection(local.saved, newestBy((s) => s.savedAt)),
  pediatricianNotes: createCollection(local.pediatricianNotes, newestBy((n) => n.createdAt)),
  activityProgress: createCollection(local.activityProgress, newestBy((p) => p.triedAt)),
  activities: createCatalog(local.activities),
};

/** After a care log changes, the home summary and timeline are stale. */
export function refreshSummaries() {
  stores.dashboard.load(true);
  stores.timeline.load(true);
}

/** Wipes device-stored demo records and reloads everything. */
export async function restoreSampleData() {
  await resetDemoData();
  await Promise.all(
    Object.values(stores).map((store) => ('reset' in store ? (store.reset(), store.load(true)) : store.load(true))),
  );
}

export { useCatalog, useCollection, useDoc } from './store';

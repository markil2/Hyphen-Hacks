import { services } from '@/services';
import { resetDemoData } from '@/services/mock/storage';
import type { BaseRecord } from '@/types';

import { createCatalog, createCollection, createDoc } from './store';

const newestBy =
  <T extends BaseRecord>(field: (item: T) => string) =>
  (a: T, b: T) =>
    field(b).localeCompare(field(a));

/** App-wide stores. Screens subscribe with useCollection / useCatalog / useDoc. */
export const stores = {
  profile: createDoc(services.profile),
  sleep: createCollection(services.sleep, newestBy((s) => s.startedAt)),
  feedings: createCollection(services.feedings, newestBy((f) => f.at)),
  diapers: createCollection(services.diapers, newestBy((d) => d.at)),
  questions: createCollection(services.questions, newestBy((q) => q.createdAt)),
  consultations: createCollection(services.consultations, newestBy((c) => c.createdAt)),
  saved: createCollection(services.saved, newestBy((s) => s.savedAt)),
  pediatricianNotes: createCollection(services.pediatricianNotes, newestBy((n) => n.createdAt)),
  activityProgress: createCollection(services.activityProgress, newestBy((p) => p.triedAt)),
  posts: createCollection(services.posts, newestBy((p) => p.createdAt)),
  products: createCatalog(services.products),
  experts: createCatalog(services.experts),
  milestones: createCatalog(services.milestones),
  activities: createCatalog(services.activities),
  groups: createCatalog(services.groups),
};

/** Wipes demo records on this device and reloads the seeded sample data. */
export async function restoreSampleData() {
  await resetDemoData();
  await Promise.all(
    Object.values(stores).map((store) => ('reset' in store ? (store.reset(), store.load(true)) : store.load(true))),
  );
}

export { useCatalog, useCollection, useDoc } from './store';

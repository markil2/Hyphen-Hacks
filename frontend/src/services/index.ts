import type { ActivityProgress, BagItem, PediatricianNote, Preferences, SavedItem } from '@/types';

import { API_URL } from './api/client';
import { remoteServices } from './api/nurture';
import type { RemoteServices } from './contracts';
import { demoServices } from './mock/remote';
import * as seed from './mock/seed';
import { localCatalog, localDoc, localRepo } from './mock/storage';

/**
 * The single switch between the real Nurture backend and the offline demo.
 * Set EXPO_PUBLIC_API_URL (e.g. http://localhost:8000/api) to use the backend.
 * The UI only ever talks to these objects, never to fetch or storage directly.
 */
export const remote: RemoteServices = API_URL ? remoteServices() : demoServices();

export const dataMode = remote.mode;
export const apiUrl = API_URL;

/** Device-only data. The backend has no endpoints for these, so they live on the phone in both modes. */
export const local = {
  preferences: localDoc<Preferences>('preferences', seed.seedPreferences),
  saved: localRepo<SavedItem>('saved', seed.seedSaved),
  pediatricianNotes: localRepo<PediatricianNote>('pedi-notes', seed.seedPediNotes),
  activityProgress: localRepo<ActivityProgress>('activity-progress', () => []),
  bag: localRepo<BagItem>('shopping-bag', () => []),
  activities: localCatalog(seed.seedActivities),
};

export type { NewRecord } from './types';

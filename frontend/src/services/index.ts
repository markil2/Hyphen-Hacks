import type {
  Activity,
  ActivityProgress,
  CommunityGroup,
  Consultation,
  DiaperEntry,
  Expert,
  FeedingEntry,
  Milestone,
  PediatricianNote,
  Post,
  Product,
  Profile,
  Question,
  SavedItem,
  SleepSession,
} from '@/types';

import { restCatalog, restDoc, restRepo } from './api/rest';
import * as catalog from './mock/seed-catalog';
import * as logs from './mock/seed-logs';
import { localCatalog, localDoc, localRepo } from './mock/storage';

/**
 * The single switch between demo data and the real backend.
 * The UI only ever talks to these objects, never to fetch or storage directly.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';

export const dataMode: 'demo' | 'api' = API_URL ? 'api' : 'demo';

const pick = <T>(demo: () => T, api: (base: string) => T): T => (API_URL ? api(API_URL) : demo());

export const services = {
  profile: pick(
    () => localDoc<Profile>('profile', logs.seedProfile),
    (b) => restDoc<Profile>(b, 'profile'),
  ),
  sleep: pick(
    () => localRepo<SleepSession>('sleep', logs.seedSleep),
    (b) => restRepo<SleepSession>(b, 'sleep-sessions'),
  ),
  feedings: pick(
    () => localRepo<FeedingEntry>('feedings', logs.seedFeedings),
    (b) => restRepo<FeedingEntry>(b, 'feedings'),
  ),
  diapers: pick(
    () => localRepo<DiaperEntry>('diapers', logs.seedDiapers),
    (b) => restRepo<DiaperEntry>(b, 'diapers'),
  ),
  questions: pick(
    () => localRepo<Question>('questions', logs.seedQuestions),
    (b) => restRepo<Question>(b, 'questions'),
  ),
  consultations: pick(
    () => localRepo<Consultation>('consultations', logs.seedConsultations),
    (b) => restRepo<Consultation>(b, 'consultations'),
  ),
  saved: pick(
    () => localRepo<SavedItem>('saved', logs.seedSaved),
    (b) => restRepo<SavedItem>(b, 'saved'),
  ),
  pediatricianNotes: pick(
    () => localRepo<PediatricianNote>('pedi-notes', logs.seedPediNotes),
    (b) => restRepo<PediatricianNote>(b, 'pediatrician-notes'),
  ),
  activityProgress: pick(
    () => localRepo<ActivityProgress>('activity-progress', logs.seedActivityProgress),
    (b) => restRepo<ActivityProgress>(b, 'activity-progress'),
  ),
  posts: pick(
    () => localRepo<Post>('posts', logs.seedPosts),
    (b) => restRepo<Post>(b, 'community/posts'),
  ),
  products: pick(
    () => localCatalog<Product>(catalog.seedProducts),
    (b) => restCatalog<Product>(b, 'products'),
  ),
  experts: pick(
    () => localCatalog<Expert>(catalog.seedExperts),
    (b) => restCatalog<Expert>(b, 'experts'),
  ),
  milestones: pick(
    () => localCatalog<Milestone>(catalog.seedMilestones),
    (b) => restCatalog<Milestone>(b, 'milestones'),
  ),
  activities: pick(
    () => localCatalog<Activity>(catalog.seedActivities),
    (b) => restCatalog<Activity>(b, 'activities'),
  ),
  groups: pick(
    () => localCatalog<CommunityGroup>(catalog.seedGroups),
    (b) => restCatalog<CommunityGroup>(b, 'community/groups'),
  ),
};

export type { NewRecord } from './types';

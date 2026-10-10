import type { BaseRecord, ContactOption } from '@/types';

import type { RemoteServices } from '../contracts';
import type { NewRecord, Repo } from '../types';
import { api, ApiError, Page } from './client';
import * as m from './map';
import type {
  ApiBaby,
  ApiConsultation,
  ApiDashboard,
  ApiDiaper,
  ApiExpert,
  ApiFeeding,
  ApiHeight,
  ApiMilestone,
  ApiProduct,
  ApiQuestion,
  ApiResource,
  ApiSleep,
  ApiTimelineEvent,
  ApiUser,
} from './types';

/**
 * Nurture backend adapters. Each one speaks the real routes in
 * backend/API_CONTRACT.md and returns the app's own types.
 */

// The demo parent has one baby; every baby-scoped call uses it.
let babyIdPromise: Promise<string> | null = null;
function babyId() {
  babyIdPromise ??= api<ApiBaby[]>('babies').then((babies) => {
    if (!babies.length) throw new ApiError('No baby profile exists on the server yet.', 404, 'NO_BABY');
    return babies[0].id;
  });
  babyIdPromise.catch(() => (babyIdPromise = null));
  return babyIdPromise;
}

const LIST = { limit: 100 };

/** Builds a Repo over a baby-scoped collection. */
function babyRepo<T extends BaseRecord, A>(opts: {
  path: string;
  item: string;
  from: (a: A) => T;
  to: (t: Partial<NewRecord<T>>) => object;
  unwrap?: (a: unknown) => A;
}): Repo<T> {
  const unwrap = opts.unwrap ?? ((a: unknown) => a as A);
  return {
    async list() {
      const page = await api<Page<A>>(`babies/${await babyId()}/${opts.path}`, { query: LIST });
      return page.items.map(opts.from);
    },
    async create(input) {
      const created = await api<unknown>(`babies/${await babyId()}/${opts.path}`, { method: 'POST', body: opts.to(input as Partial<NewRecord<T>>) });
      return opts.from(unwrap(created));
    },
    async update(id, patch) {
      return opts.from(unwrap(await api<unknown>(`${opts.item}/${id}`, { method: 'PATCH', body: opts.to(patch) })));
    },
    async remove(id) {
      await api(`${opts.item}/${id}`, { method: 'DELETE' });
    },
  };
}

export function remoteServices(): RemoteServices {
  return {
    mode: 'api',

    baby: {
      async get() {
        const id = await babyId();
        return m.fromBaby(await api<ApiBaby>(`babies/${id}`));
      },
      async save(baby) {
        return m.fromBaby(await api<ApiBaby>(`babies/${baby.id}`, { method: 'PATCH', body: { name: baby.name, birthDate: baby.birthDate } }));
      },
    },

    account: {
      async get() {
        const me = await api<ApiUser | { user: ApiUser }>('auth/me');
        const user = 'user' in me ? me.user : me;
        return { name: user.name, email: user.email };
      },
    },

    sleep: {
      async list() {
        return (await api<Page<ApiSleep>>(`babies/${await babyId()}/sleep`, { query: LIST })).items.map(m.fromSleep);
      },
      async create(input) {
        const s = await api<ApiSleep>(`babies/${await babyId()}/sleep/start`, {
          method: 'POST',
          body: { startTime: input.startedAt, ...(input.notes ? { notes: input.notes } : {}) },
        });
        return m.fromSleep(s);
      },
      async update(id, patch) {
        return m.fromSleep(await api<ApiSleep>(`sleep/${id}`, { method: 'PATCH', body: m.toSleepPatch(patch) }));
      },
      async remove(id) {
        await api(`sleep/${id}`, { method: 'DELETE' });
      },
    },

    feedings: babyRepo({
      path: 'feedings',
      item: 'feedings',
      from: (f: ApiFeeding) => m.fromFeeding(f),
      to: (f) => m.toFeeding(f as NewRecord<import('@/types').FeedingEntry>),
    }),

    diapers: babyRepo({ path: 'diapers', item: 'diapers', from: (d: ApiDiaper) => m.fromDiaper(d), to: m.toDiaper }),

    heights: babyRepo({
      path: 'heights',
      item: 'heights',
      from: (h: ApiHeight) => m.fromHeight(h),
      to: m.toHeight,
      unwrap: (a) => (a as { measurement: ApiHeight }).measurement,
    }),

    milestones: babyRepo({
      path: 'milestones',
      item: 'milestones',
      from: (x: ApiMilestone) => m.fromMilestone(x),
      to: m.toMilestone,
      unwrap: (a) => (a as { milestone: ApiMilestone }).milestone,
    }),

    questions: {
      async list() {
        return (await api<Page<ApiQuestion>>('questions', { query: LIST })).items.map(m.fromQuestion);
      },
    },

    consultations: {
      async list() {
        return (await api<Page<ApiConsultation>>('consultations', { query: LIST })).items.map(m.fromConsultation);
      },
      async setStatus(id, status) {
        return m.fromConsultation(await api<ApiConsultation>(`consultations/${id}/status`, { method: 'PATCH', body: { status } }));
      },
    },

    experts: {
      async list() {
        return (await api<Page<ApiExpert>>('experts', { query: LIST })).items.map(m.fromExpert);
      },
    },

    products: {
      async list() {
        return (await api<Page<ApiProduct>>('nutrition/products', { query: LIST })).items.map(m.fromProduct);
      },
    },

    resources: {
      async list() {
        return (await api<Page<ApiResource>>('resources', { query: LIST })).items.map(m.fromResource);
      },
    },

    support: {
      async ask(text, category) {
        const id = await babyId().catch(() => undefined);
        const res = await api<{ question: ApiQuestion; mayBeUrgent: boolean; safetyNotice: string }>('questions', {
          method: 'POST',
          body: { question: text, category, ...(id ? { babyId: id } : {}) },
        });
        return { question: m.fromQuestion(res.question), mayBeUrgent: res.mayBeUrgent, safetyNotice: res.safetyNotice };
      },
      async match(questionId) {
        const res = await api<{
          category: string;
          recommendedSpecialties: string[];
          experts: ApiExpert[];
          resources: ApiResource[];
          mayBeUrgent: boolean;
          safetyNotice: string;
        }>(`questions/${questionId}/match-experts`, { method: 'POST' });
        return {
          category: res.category as never,
          recommendedSpecialties: res.recommendedSpecialties,
          experts: res.experts.map(m.fromExpert),
          resources: res.resources.map(m.fromResource),
          mayBeUrgent: res.mayBeUrgent,
          safetyNotice: res.safetyNotice,
        };
      },
      async expertDetail(id) {
        const res = await api<ApiExpert & { directoryNotice: string }>(`experts/${id}`);
        return { expert: m.fromExpert(res), notice: res.directoryNotice };
      },
      async contactOptions(id) {
        const res = await api<{ options: ContactOption[]; contactNotice: string }>(`experts/${id}/contact-options`);
        return { options: res.options, notice: res.contactNotice };
      },
      async expertCategories() {
        return (await api<{ serviceCategories: string[] }>('experts/categories')).serviceCategories;
      },
      async requestConsultation(input) {
        const res = await api<{ request: ApiConsultation; demoNotice: string }>('consultations', { method: 'POST', body: input });
        return { consultation: m.fromConsultation(res.request), notice: res.demoNotice };
      },
    },

    catalog: {
      async searchProducts(q) {
        return (await api<Page<ApiProduct>>('nutrition/search', { query: { q, limit: 100 } })).items.map(m.fromProduct);
      },
      async productCategories() {
        return api<string[]>('nutrition/categories');
      },
      async productDetail(id) {
        const res = await api<{ product: ApiProduct; disclaimer: string }>(`nutrition/products/${id}`);
        return { product: m.fromProduct(res.product), disclaimer: res.disclaimer };
      },
    },

    dashboard: {
      async summary() {
        const d = await api<ApiDashboard>(`babies/${await babyId()}/dashboard`, {
          query: { timezoneOffsetMinutes: new Date().getTimezoneOffset() },
        });
        const dayStart = new Date(d.day.start).getTime();
        return {
          todaySleepMinutes: d.todaySleepMinutes,
          feedingsToday: d.feedingsToday.length,
          lastFeedingAt: d.latestFeeding?.startTime ?? null,
          diapersToday: d.recentDiapers.filter((x) => new Date(x.timestamp).getTime() >= dayStart).length,
          latestHeight: d.latestHeight ? m.fromHeight(d.latestHeight) : null,
        };
      },
      async timeline() {
        return (await api<ApiTimelineEvent[]>(`babies/${await babyId()}/timeline`, { query: { limit: 20 } })).map(m.fromTimeline);
      },
    },

    async health() {
      return api<{ status: string; demoMode: boolean }>('health');
    },
  };
}

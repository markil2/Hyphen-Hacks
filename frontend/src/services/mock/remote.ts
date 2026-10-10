import type { Consultation, Expert, QuestionCategory, TimelineEvent } from '@/types';

import type { RemoteServices } from '../contracts';
import * as seed from './seed';
import { localCatalog, localDoc, localRepo, newId, simulateNetwork } from './storage';

/**
 * Offline stand-in for the Nurture backend, used only when no API URL is set.
 * It mirrors the real API's behaviour closely enough to demo the app, and says so.
 */

const DEMO_NOTICE = 'Offline demo: this is stored on this device only and was not sent to anyone.';
const MATCH: Record<QuestionCategory, string[]> = {
  feeding: ['lactation', 'pediatrics'],
  sleep: ['sleep', 'pediatrics'],
  development: ['pediatrics'],
  health: ['pediatrics'],
  general: ['pediatrics', 'sleep'],
};
const URGENT = ['not breathing', 'blue lips', 'unresponsive', 'seizure', 'choking', 'severe bleeding', 'high fever'];

export function demoServices(): RemoteServices {
  const sleep = localRepo('sleep', seed.seedSleep);
  const feedings = localRepo('feedings', seed.seedFeedings);
  const diapers = localRepo('diapers', seed.seedDiapers);
  const heights = localRepo('heights', seed.seedHeights);
  const milestones = localRepo('milestones', seed.seedMilestones);
  const questions = localRepo('questions', seed.seedQuestions);
  const consultations = localRepo<Consultation>('consultations', seed.seedConsultations);
  const experts = localCatalog(seed.seedExperts);
  const products = localCatalog(seed.seedProducts);
  const resources = localCatalog(seed.seedResources);

  const findExpert = async (id: string) => {
    const e = (await experts.list()).find((x) => x.id === id);
    if (!e) throw new Error('That profile couldn’t be found.');
    return e;
  };

  return {
    mode: 'demo',
    baby: localDoc('baby', seed.seedBaby),
    babies: {
      async list() {
        await simulateNetwork();
        return [seed.seedBaby()];
      },
      async create(input) {
        await simulateNetwork();
        return { ...seed.seedBaby(), ...input };
      },
    },
    account: {
      async get() {
        await simulateNetwork();
        return { name: 'Sam' };
      },
      async remove() {
        throw new Error('There is no account to delete in the offline demo.');
      },
    },
    resetSession() {},
    sleep,
    feedings,
    diapers,
    heights,
    milestones,
    questions,
    consultations: {
      list: consultations.list,
      setStatus: (id, status) => consultations.update(id, { status }),
    },
    experts,
    products,
    resources,
    support: {
      async ask(text, category) {
        const question = await questions.create({ text, category, createdAt: new Date().toISOString(), status: 'submitted' });
        const mayBeUrgent = URGENT.some((t) => text.toLowerCase().includes(t));
        return {
          question,
          mayBeUrgent,
          safetyNotice: mayBeUrgent
            ? 'This wording could describe an emergency. Contact local emergency services or a qualified medical professional now.'
            : 'This matching tool does not diagnose, provide treatment, or replace medical care.',
        };
      },
      async match(questionId) {
        const q = (await questions.list()).find((x) => x.id === questionId);
        const category = q?.category ?? 'general';
        const all = await experts.list();
        return {
          category,
          recommendedSpecialties: MATCH[category],
          experts: all.filter((e: Expert) => MATCH[category].includes(e.serviceCategory)),
          resources: (await resources.list()).filter((r) => r.category === category),
          mayBeUrgent: false,
          safetyNotice: 'This matching tool does not diagnose, provide treatment, or replace medical care.',
        };
      },
      async expertDetail(id) {
        return { expert: await findExpert(id), notice: 'Offline demo profile. Not a real person.' };
      },
      async contactOptions(id) {
        const e = await findExpert(id);
        const options = (['phone', 'email', 'website'] as const).filter((t) => e[t]).map((t) => ({ type: t, value: e[t]! }));
        return { options, notice: 'Contact goes to an external provider. Nurture does not send messages on your behalf.' };
      },
      async expertCategories() {
        return [...new Set((await experts.list()).map((e) => e.serviceCategory))].sort();
      },
      async requestConsultation(input) {
        const e = await findExpert(input.expertId);
        const consultation = await consultations.create({
          ...input,
          expertName: e.name,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        return { consultation, notice: DEMO_NOTICE };
      },
    },
    catalog: {
      async searchProducts(q) {
        const needle = q.toLowerCase();
        return (await products.list()).filter((p) => [p.name, p.brand, p.category].some((f) => f.toLowerCase().includes(needle)));
      },
      async productCategories() {
        return [...new Set((await products.list()).map((p) => p.category))].sort();
      },
      async productDetail(id) {
        const product = (await products.list()).find((p) => p.id === id);
        if (!product) throw new Error('That product couldn’t be found.');
        return { product, disclaimer: 'Sample data only. Verify labeling with the manufacturer and ask a pediatric professional about suitability.' };
      },
    },
    dashboard: {
      async summary() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const today = (iso: string) => new Date(iso) >= start;
        const [s, f, d, h] = await Promise.all([sleep.list(), feedings.list(), diapers.list(), heights.list()]);
        const done = s.filter((x) => x.endedAt && today(x.startedAt));
        const feedsToday = f.filter((x) => today(x.at)).sort((a, b) => b.at.localeCompare(a.at));
        return {
          todaySleepMinutes: done.reduce((sum, x) => sum + Math.round((new Date(x.endedAt!).getTime() - new Date(x.startedAt).getTime()) / 60000), 0),
          feedingsToday: feedsToday.length,
          lastFeedingAt: feedsToday[0]?.at ?? null,
          diapersToday: d.filter((x) => today(x.at)).length,
          latestHeight: [...h].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0] ?? null,
        };
      },
      async timeline() {
        const [s, f, d] = await Promise.all([sleep.list(), feedings.list(), diapers.list()]);
        const events: TimelineEvent[] = [
          ...s.map((x) => ({ type: 'sleep' as const, at: x.startedAt, title: x.endedAt ? 'Sleep session' : 'Sleep session started' })),
          ...f.map((x) => ({ type: 'feeding' as const, at: x.at, title: x.kind === 'solid' ? `Solids · ${x.food}` : x.kind === 'formula' ? 'Formula' : 'Breast milk' })),
          ...d.map((x) => ({ type: 'diaper' as const, at: x.at, title: `Diaper · ${x.kind === 'both' ? 'wet + dirty' : x.kind}` })),
        ];
        return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
      },
    },
    async health() {
      await simulateNetwork();
      return { status: 'offline-demo', demoMode: true };
    },
  };
}

export { newId };

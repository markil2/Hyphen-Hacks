import type {
  BabyHealthEntry,
  MomMeasurement,
  Baby,
  Consultation,
  ConsultationStatus,
  DiaperEntry,
  DiaperKind,
  Expert,
  FeedingEntry,
  HeightMeasurement,
  MilestoneType,
  Product,
  Question,
  QuestionCategory,
  RecordedMilestone,
  Resource,
  SleepSession,
  TimelineEvent,
} from '@/types';

import type { NewRecord } from '../types';
import type {
  ApiBaby,
  ApiBabyHealth,
  ApiMomMeasurement,
  ApiConsultation,
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
} from './types';

/**
 * Translation between backend records and the app's types.
 * Kept in one file so a change to the API shape only touches this layer.
 */

const opt = <T>(value: T | null | undefined) => (value === null ? undefined : value);
const MIN = 60_000;

export const fromBaby = (b: ApiBaby): Baby => ({
  id: b.id,
  origin: 'api',
  name: b.name,
  birthDate: b.birthDate,
  sexAtBirth: (b.sexAtBirth as Baby['sexAtBirth']) ?? null,
});

export const fromSleep = (s: ApiSleep): SleepSession => ({
  id: s.id,
  origin: 'api',
  startedAt: s.startTime,
  endedAt: s.endTime,
  notes: opt(s.notes),
});

export const toSleepPatch = (s: Partial<NewRecord<SleepSession>>) => ({
  ...(s.startedAt !== undefined && { startTime: s.startedAt }),
  ...(s.endedAt !== undefined && { endTime: s.endedAt }),
  ...(s.notes !== undefined && { notes: s.notes || null }),
});

export function fromFeeding(f: ApiFeeding): FeedingEntry {
  const base = { id: f.id, origin: 'api' as const, at: f.startTime, notes: opt(f.notes) };
  const ml = f.amount != null && f.unit === 'ml' ? f.amount : f.amount != null && f.unit === 'oz' ? Math.round(f.amount * 29.57) : undefined;
  if (f.feedingType === 'solids') return { ...base, kind: 'solid', food: f.foodName ?? 'Solid food' };
  if (f.feedingType === 'breast_milk' && f.feedingMethod !== 'bottle') {
    const durationMin = f.endTime ? Math.round((new Date(f.endTime).getTime() - new Date(f.startTime).getTime()) / MIN) : undefined;
    return { ...base, kind: 'breast', method: 'nursing', durationMin: durationMin || undefined };
  }
  if (f.feedingType === 'breast_milk') return { ...base, kind: 'breast', method: 'bottle', amountMl: ml };
  return { ...base, kind: 'formula', amountMl: ml };
}

export function toFeeding(f: NewRecord<FeedingEntry>) {
  const common = { startTime: f.at, notes: f.notes || null };
  switch (f.kind) {
    case 'solid':
      return { ...common, feedingType: 'solids', feedingMethod: 'solid', milkType: null, foodName: f.food, amount: null, unit: null, endTime: null };
    case 'formula':
      return { ...common, feedingType: 'formula', feedingMethod: 'bottle', milkType: 'formula', amount: f.amountMl ?? null, unit: f.amountMl ? 'ml' : null, foodName: null, endTime: null };
    case 'breast':
      if (f.method === 'bottle') {
        return { ...common, feedingType: 'breast_milk', feedingMethod: 'bottle', milkType: 'breast_milk', amount: f.amountMl ?? null, unit: f.amountMl ? 'ml' : null, foodName: null, endTime: null };
      }
      return {
        ...common,
        feedingType: 'breast_milk',
        feedingMethod: 'breast',
        milkType: null,
        amount: null,
        unit: null,
        foodName: null,
        endTime: f.durationMin ? new Date(new Date(f.at).getTime() + f.durationMin * MIN).toISOString() : null,
      };
  }
}

const diaperIn: Record<ApiDiaper['type'], DiaperKind> = { wet: 'wet', dirty: 'dirty', mixed: 'both' };
const diaperOut: Record<DiaperKind, ApiDiaper['type']> = { wet: 'wet', dirty: 'dirty', both: 'mixed' };

export const fromDiaper = (d: ApiDiaper): DiaperEntry => ({ id: d.id, origin: 'api', at: d.timestamp, kind: diaperIn[d.type], notes: opt(d.notes) });

export const toDiaper = (d: Partial<NewRecord<DiaperEntry>>) => ({
  ...(d.kind && { type: diaperOut[d.kind] }),
  ...(d.at && { timestamp: d.at }),
  ...(d.notes !== undefined && { notes: d.notes || null }),
});

export const fromHeight = (h: ApiHeight): HeightMeasurement => ({
  id: h.id,
  origin: 'api',
  height: h.height,
  unit: h.unit,
  measuredAt: h.measuredAt,
  notes: opt(h.notes),
});

export const toHeight = (h: Partial<NewRecord<HeightMeasurement>>) => ({
  ...(h.height !== undefined && { height: h.height }),
  ...(h.unit && { unit: h.unit }),
  ...(h.measuredAt && { measuredAt: h.measuredAt }),
  ...(h.notes !== undefined && { notes: h.notes || null }),
});

export const fromMilestone = (m: ApiMilestone): RecordedMilestone => ({
  id: m.id,
  origin: 'api',
  type: m.type as MilestoneType,
  title: m.title,
  achievedAt: m.achievedAt,
  notes: opt(m.notes),
});

export const toMilestone = (m: Partial<NewRecord<RecordedMilestone>>) => ({
  ...(m.type && { type: m.type }),
  ...(m.title && { title: m.title }),
  ...(m.achievedAt && { achievedAt: m.achievedAt }),
  ...(m.notes !== undefined && { notes: m.notes || null }),
});

export const fromQuestion = (q: ApiQuestion): Question => ({
  id: q.id,
  origin: 'api',
  text: q.question,
  category: q.category as QuestionCategory,
  createdAt: q.createdAt,
  status: q.status,
});

export const fromExpert = (e: ApiExpert): Expert => ({
  id: e.id,
  origin: 'api',
  name: e.name,
  organization: opt(e.organization),
  specialty: e.specialty,
  serviceCategory: e.serviceCategory,
  audience: e.audience,
  credentials: e.credentials,
  verificationStatus: e.verificationStatus,
  affiliationStatus: e.affiliationStatus,
  description: e.description,
  sourceUrl: opt(e.sourceUrl),
  phone: opt(e.phone),
  email: opt(e.email),
  website: opt(e.website),
  availabilityStatus: e.availabilityStatus,
  isDemo: e.isDemo,
});

export const fromConsultation = (c: ApiConsultation): Consultation => ({
  id: c.id,
  origin: 'api',
  expertId: c.expertId,
  expertName: c.expert?.name,
  questionId: opt(c.questionId),
  questionText: c.question?.question,
  message: c.message,
  status: c.status as ConsultationStatus,
  createdAt: c.createdAt,
});

export const fromProduct = (p: ApiProduct): Product => ({ ...p, origin: 'api' });

export const fromResource = (r: ApiResource): Resource => ({ ...r, origin: 'api', reviewedAt: opt(r.reviewedAt) });

const feedingLabel = (d: Record<string, unknown>) => {
  if (d.feedingType === 'solids') return `Solids · ${String(d.foodName ?? 'food')}`;
  if (d.feedingType === 'formula') return d.amount ? `Formula · ${d.amount} ${d.unit ?? ''}`.trim() : 'Formula';
  if (d.feedingMethod === 'bottle') return d.amount ? `Breast milk bottle · ${d.amount} ${d.unit ?? ''}`.trim() : 'Breast milk bottle';
  return 'Nursing';
};

export function fromTimeline(e: ApiTimelineEvent): TimelineEvent {
  const d = e.data;
  const titles: Record<ApiTimelineEvent['type'], () => string> = {
    sleep: () => (d.endTime ? `Slept ${d.durationMinutes ?? 0} min` : 'Sleep session started'),
    feeding: () => feedingLabel(d),
    diaper: () => `Diaper · ${d.type === 'mixed' ? 'wet + dirty' : String(d.type)}`,
    question: () => 'Question saved',
    height: () => `Height · ${d.height} ${d.unit}`,
    milestone: () => `Milestone · ${String(d.title ?? '')}`,
    health: () => `Health note · ${String(d.type ?? '')}`,
  };
  return { type: e.type, at: e.timestamp, title: titles[e.type]?.() ?? e.type };
}

const severities = ['mild', 'moderate', 'severe'] as const;

export const fromBabyHealth = (h: ApiBabyHealth): BabyHealthEntry => ({
  id: h.id,
  origin: 'api',
  type: h.type,
  at: h.observedAt,
  value: opt(h.value),
  unit: opt(h.unit),
  severity: severities.find((s) => s === h.severity),
  notes: opt(h.notes),
});

export const toBabyHealth = (h: Partial<NewRecord<BabyHealthEntry>>) => ({
  ...(h.type && { type: h.type }),
  ...(h.at && { observedAt: h.at }),
  ...(h.value !== undefined && { value: h.value }),
  ...(h.unit !== undefined && { unit: h.unit || null }),
  ...(h.severity !== undefined && { severity: h.severity }),
  ...(h.notes !== undefined && { notes: h.notes || null }),
});

export const fromMomMeasurement = (x: ApiMomMeasurement): MomMeasurement => ({
  id: x.id,
  origin: 'api',
  type: x.type,
  at: x.measuredAt,
  value: opt(x.value),
  unit: opt(x.unit),
  systolic: opt(x.systolic),
  diastolic: opt(x.diastolic),
  notes: opt(x.notes),
});

export const toMomMeasurement = (x: Partial<NewRecord<MomMeasurement>>) => ({
  ...(x.type && { type: x.type }),
  ...(x.at && { measuredAt: x.at }),
  ...(x.value !== undefined && { value: x.value }),
  ...(x.unit !== undefined && { unit: x.unit }),
  ...(x.systolic !== undefined && { systolic: x.systolic }),
  ...(x.diastolic !== undefined && { diastolic: x.diastolic }),
  ...(x.notes !== undefined && { notes: x.notes || null }),
});

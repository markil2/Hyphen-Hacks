/**
 * Domain types shared by the UI and the service layer.
 *
 * Shapes follow what the Nurture backend actually stores (backend/API_CONTRACT.md).
 * Every record carries `origin` so the UI can tell offline demo data from
 * records that came back from the server.
 */

export type Origin = 'demo' | 'api';

export type ISODate = string;

export interface BaseRecord {
  id: string;
  origin: Origin;
}

/* ── Baby & account ────────────────────────────────────────── */

export interface Baby extends BaseRecord {
  name: string;
  birthDate: ISODate;
  sexAtBirth?: 'female' | 'male' | 'intersex' | 'not_recorded' | null;
}

export interface Account {
  name: string;
  email?: string;
}

/** Device-only preferences; the backend has no endpoint for these. */
export interface Preferences {
  reduceMotion: boolean;
  notifyFeedingReminders: boolean;
  notifyConsultUpdates: boolean;
}

/* ── Care logs ─────────────────────────────────────────────── */

export interface SleepSession extends BaseRecord {
  startedAt: ISODate;
  endedAt: ISODate | null;
  notes?: string;
}

export type FeedingEntry = BaseRecord & {
  at: ISODate;
  notes?: string;
} & (
    | { kind: 'breast'; method: 'nursing'; durationMin?: number }
    | { kind: 'breast'; method: 'bottle'; amountMl?: number }
    | { kind: 'formula'; amountMl?: number }
    | { kind: 'solid'; food: string }
  );

export type DiaperKind = 'wet' | 'dirty' | 'both';

export interface DiaperEntry extends BaseRecord {
  at: ISODate;
  kind: DiaperKind;
  notes?: string;
}

export interface HeightMeasurement extends BaseRecord {
  height: number;
  unit: 'cm' | 'in';
  measuredAt: ISODate;
  notes?: string;
}

export type MilestoneType =
  | 'rolling'
  | 'sitting'
  | 'crawling'
  | 'standing'
  | 'walking'
  | 'first_word'
  | 'talking'
  | 'social'
  | 'motor'
  | 'other';

export interface RecordedMilestone extends BaseRecord {
  type: MilestoneType;
  title: string;
  achievedAt: ISODate;
  notes?: string;
}

/* ── Support ───────────────────────────────────────────────── */

export type QuestionCategory = 'feeding' | 'sleep' | 'development' | 'health' | 'general';

export interface Question extends BaseRecord {
  text: string;
  category: QuestionCategory;
  createdAt: ISODate;
  status: string;
}

/** What the backend says right after a question is saved. */
export interface QuestionReceipt {
  question: Question;
  mayBeUrgent: boolean;
  safetyNotice: string;
}

export interface Expert extends BaseRecord {
  name: string;
  organization?: string;
  specialty: string;
  serviceCategory: string;
  audience: 'parent' | 'baby_child' | 'family' | string;
  credentials: string;
  verificationStatus: string;
  affiliationStatus: string;
  description: string;
  sourceUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  availabilityStatus: string;
  /** True for fictional demo profiles, false for real external listings. */
  isDemo: boolean;
}

export interface ExpertMatch {
  category: QuestionCategory;
  recommendedSpecialties: string[];
  experts: Expert[];
  resources: Resource[];
  mayBeUrgent: boolean;
  safetyNotice: string;
}

export interface ContactOption {
  type: 'phone' | 'email' | 'website';
  value: string;
}

export interface ContactOptions {
  options: ContactOption[];
  notice: string;
}

export type ConsultationStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Consultation extends BaseRecord {
  expertId: string;
  expertName?: string;
  questionId?: string;
  questionText?: string;
  message: string;
  status: ConsultationStatus;
  createdAt: ISODate;
}

/* ── Catalog content ───────────────────────────────────────── */

export interface Product extends BaseRecord {
  name: string;
  brand: string;
  category: string;
  description: string;
  ingredients: string;
  ageGuidance: string;
  sourceUrl: string;
  expertReviewStatus: string;
  isSample: boolean;
}

export interface Resource extends BaseRecord {
  title: string;
  category: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  reviewedAt?: ISODate;
}

/* ── Device-only content ───────────────────────────────────── */

export interface SavedItem extends BaseRecord {
  kind: 'product' | 'resource' | 'activity' | 'expert';
  refId: string;
  title: string;
  savedAt: ISODate;
}

export interface PediatricianNote extends BaseRecord {
  text: string;
  createdAt: ISODate;
  context?: string;
}

export interface Activity extends BaseRecord {
  title: string;
  monthsFrom: number;
  monthsTo: number;
  minutes: number;
  description: string;
}

export interface ActivityProgress extends BaseRecord {
  activityId: string;
  triedAt: ISODate;
}

/* ── Dashboard ─────────────────────────────────────────────── */

export interface TimelineEvent {
  type: 'sleep' | 'feeding' | 'diaper' | 'question' | 'height' | 'milestone' | 'health';
  at: ISODate;
  title: string;
}

export interface DashboardSummary {
  todaySleepMinutes: number;
  feedingsToday: number;
  lastFeedingAt: ISODate | null;
  diapersToday: number;
  latestHeight: HeightMeasurement | null;
}

/**
 * Domain types shared by the UI and the service layer.
 *
 * Every record carries `origin` so the UI can always tell sample content apart
 * from data that came back from the real backend.
 */

export type Origin = 'demo' | 'api';

export type ISODate = string;

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface Source {
  label: string;
  url?: string;
}

export interface Verification {
  status: VerificationStatus;
  /** Who verified it and how — only shown when status is `verified`. */
  note?: string;
  sources: Source[];
}

export interface BaseRecord {
  id: string;
  origin: Origin;
}

/* ── Care logs ─────────────────────────────────────────────── */

export interface SleepSession extends BaseRecord {
  startedAt: ISODate;
  endedAt: ISODate | null;
  notes?: string;
}

export type BreastSide = 'left' | 'right' | 'both';

export type FeedingEntry = BaseRecord & {
  at: ISODate;
  notes?: string;
} & (
    | { kind: 'breast'; method: 'nursing'; side?: BreastSide; durationMin?: number }
    | { kind: 'breast'; method: 'bottle'; amountMl?: number }
    | { kind: 'formula'; amountMl?: number }
    | { kind: 'solid'; food: string }
  );

export type FeedingKind = FeedingEntry['kind'];

export type DiaperKind = 'wet' | 'dirty' | 'both';

export interface DiaperEntry extends BaseRecord {
  at: ISODate;
  kind: DiaperKind;
  notes?: string;
}

/* ── Profiles & settings ───────────────────────────────────── */

export interface BabyProfile {
  name: string;
  birthDate: ISODate;
  pronoun: 'she' | 'he' | 'they';
}

export interface ParentProfile {
  name: string;
  role: string;
}

export interface Preferences {
  supportTopics: string[];
  contactMethods: ('chat' | 'video' | 'phone')[];
  notifyFeedingReminders: boolean;
  notifyConsultUpdates: boolean;
  notifyCommunityReplies: boolean;
  shareWithPartner: boolean;
  showInCommunity: boolean;
  reduceMotion: boolean;
}

export interface Profile extends BaseRecord {
  parent: ParentProfile;
  baby: BabyProfile;
  partnerName?: string;
  preferences: Preferences;
}

/* ── Catalog content ───────────────────────────────────────── */

export type ProductCategory = 'formula' | 'baby-food' | 'nutrition';

export interface Product extends BaseRecord {
  name: string;
  brand: string;
  category: ProductCategory;
  summary: string;
  details: string[];
  ageRange?: string;
  verification: Verification;
}

export type SupportTopic = 'sleep' | 'feeding' | 'soothing' | 'development' | 'recovery' | 'other';

export interface Expert extends BaseRecord {
  name: string;
  role: string;
  specialty: string;
  topics: SupportTopic[];
  credentials: string;
  bio: string;
  contactMethods: ('chat' | 'video' | 'phone')[];
  verification: Verification;
  /** Sample availability, ISO start times. Empty means not currently taking requests. */
  availability: ISODate[];
  initials: string;
  tone: 'sage' | 'blue' | 'terracotta' | 'wood';
}

export interface Question extends BaseRecord {
  text: string;
  topic: SupportTopic;
  createdAt: ISODate;
  status: 'recorded' | 'sent' | 'answered';
}

export type ConsultationStatus = 'pending' | 'confirmed' | 'unavailable' | 'cancelled';

export interface ConsultMessage {
  id: string;
  from: 'parent' | 'expert' | 'system';
  text: string;
  at: ISODate;
}

export interface Consultation extends BaseRecord {
  expertId: string;
  slot: ISODate;
  method: 'chat' | 'video' | 'phone';
  topic: SupportTopic;
  note: string;
  status: ConsultationStatus;
  createdAt: ISODate;
  messages: ConsultMessage[];
}

export interface SavedItem extends BaseRecord {
  kind: 'product' | 'resource' | 'answer' | 'activity' | 'post';
  refId: string;
  title: string;
  savedAt: ISODate;
}

export interface PediatricianNote extends BaseRecord {
  text: string;
  createdAt: ISODate;
  context?: string;
}

export interface Milestone extends BaseRecord {
  ageLabel: string;
  monthsFrom: number;
  monthsTo: number;
  title: string;
  examples: string[];
  verification: Verification;
}

export interface Activity extends BaseRecord {
  title: string;
  monthsFrom: number;
  monthsTo: number;
  minutes: number;
  description: string;
  verification: Verification;
}

export interface ActivityProgress extends BaseRecord {
  activityId: string;
  triedAt: ISODate;
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
}

export interface Post extends BaseRecord {
  groupId: string;
  author: string;
  createdAt: ISODate;
  title: string;
  body: string;
  replies: number;
  /** True when written by this device's parent in the demo. */
  mine?: boolean;
  hidden?: boolean;
  reported?: boolean;
}

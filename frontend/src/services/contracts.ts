import type {
  Account,
  Baby,
  Consultation,
  ConsultationStatus,
  ContactOptions,
  DashboardSummary,
  DiaperEntry,
  Expert,
  ExpertMatch,
  FeedingEntry,
  HeightMeasurement,
  Product,
  Question,
  QuestionCategory,
  QuestionReceipt,
  RecordedMilestone,
  Resource,
  SleepSession,
  TimelineEvent,
} from '@/types';

import type { Catalog, DocRepo, Repo } from './types';

/**
 * Everything the app can get from "the server" — implemented by the real
 * Nurture API (api/nurture.ts) and by the offline demo (mock/remote.ts).
 */
export interface RemoteServices {
  mode: 'api' | 'demo';
  baby: DocRepo<Baby>;
  /** Babies the signed-in parent can see; a new account starts with none. */
  babies: {
    list(): Promise<Baby[]>;
    create(input: { name: string; birthDate: string }): Promise<Baby>;
  };
  account: {
    get(): Promise<Account>;
    /** Removes the Nurture profile (and, when the server allows, the sign-in). */
    remove(): Promise<{ authAccountDeleted: boolean }>;
  };
  /** Forget anything cached for the previous user (call on sign-in/out). */
  resetSession(): void;
  sleep: Repo<SleepSession>;
  feedings: Repo<FeedingEntry>;
  diapers: Repo<DiaperEntry>;
  heights: Repo<HeightMeasurement>;
  milestones: Repo<RecordedMilestone>;
  questions: Catalog<Question>;
  consultations: Catalog<Consultation> & { setStatus(id: string, status: ConsultationStatus): Promise<Consultation> };
  experts: Catalog<Expert>;
  products: Catalog<Product>;
  resources: Catalog<Resource>;
  support: {
    ask(text: string, category: QuestionCategory): Promise<QuestionReceipt>;
    match(questionId: string): Promise<ExpertMatch>;
    expertDetail(id: string): Promise<{ expert: Expert; notice: string }>;
    contactOptions(id: string): Promise<ContactOptions>;
    expertCategories(): Promise<string[]>;
    requestConsultation(input: { expertId: string; questionId?: string; message: string }): Promise<{ consultation: Consultation; notice: string }>;
  };
  catalog: {
    searchProducts(q: string): Promise<Product[]>;
    productCategories(): Promise<string[]>;
    productDetail(id: string): Promise<{ product: Product; disclaimer: string }>;
  };
  dashboard: {
    summary(): Promise<DashboardSummary>;
    timeline(): Promise<TimelineEvent[]>;
  };
  health(): Promise<{ status: string; demoMode: boolean }>;
}

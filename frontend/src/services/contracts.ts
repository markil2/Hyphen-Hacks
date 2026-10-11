import type {
  Account,
  Baby,
  BabyHealthEntry,
  BabyStats,
  BabySummary,
  FamilyNote,
  FoodHit,
  HormoneEntry,
  MomMeasurement,
  RecipeIdeas,
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
  ShopProduct,
  TimelineEvent,
  WeightMeasurement,
} from '@/types';

import type { Catalog, DocRepo, Repo } from './types';

/**
 * Everything the app can get from "the server" — implemented by the real
 * Nurture API (api/nurture.ts) and by the offline demo (mock/remote.ts).
 */
export interface RemoteServices {
  mode: 'api' | 'demo';
  baby: DocRepo<Baby>;
  account: { get(): Promise<Account> };
  sleep: Repo<SleepSession>;
  feedings: Repo<FeedingEntry>;
  diapers: Repo<DiaperEntry>;
  heights: Repo<HeightMeasurement>;
  weights: Repo<WeightMeasurement>;
  milestones: Repo<RecordedMilestone>;
  babyHealth: Repo<BabyHealthEntry>;
  momHealth: Repo<MomMeasurement>;
  hormones: Repo<HormoneEntry>;
  notes: Repo<FamilyNote>;
  ai: {
    recipeIdeas(): Promise<RecipeIdeas>;
    babySummary(): Promise<BabySummary>;
  };
  foods: {
    search(q: string, babyOnly: boolean): Promise<FoodHit[]>;
    shop(): Promise<{ items: ShopProduct[]; notice: string }>;
  };
  stats: {
    get(days: number): Promise<BabyStats>;
  };
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

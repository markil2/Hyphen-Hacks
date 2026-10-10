/** Raw records exactly as the Nurture backend returns them (see backend/prisma/schema.prisma). */

export interface ApiBaby {
  id: string;
  name: string;
  birthDate: string;
  sexAtBirth?: string | null;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
}

export interface ApiSleep {
  id: string;
  babyId: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number | null;
  notes: string | null;
}

export interface ApiFeeding {
  id: string;
  babyId: string;
  feedingType: 'breast_milk' | 'formula' | 'solids';
  feedingMethod: 'breast' | 'bottle' | 'solid' | null;
  milkType: 'breast_milk' | 'formula' | 'mixed' | null;
  amount: number | null;
  unit: 'ml' | 'oz' | 'g' | 'serving' | null;
  foodName: string | null;
  foodDescription: string | null;
  startTime: string;
  endTime: string | null;
  notes: string | null;
}

export interface ApiDiaper {
  id: string;
  babyId: string;
  type: 'wet' | 'dirty' | 'mixed';
  timestamp: string;
  notes: string | null;
}

export interface ApiHeight {
  id: string;
  height: number;
  unit: 'cm' | 'in';
  measuredAt: string;
  notes: string | null;
}

export interface ApiMilestone {
  id: string;
  type: string;
  title: string;
  achievedAt: string;
  notes: string | null;
}

export interface ApiQuestion {
  id: string;
  question: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface ApiExpert {
  id: string;
  name: string;
  organization: string | null;
  specialty: string;
  serviceCategory: string;
  audience: string;
  credentials: string;
  verificationStatus: string;
  affiliationStatus: string;
  description: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  sourceUrl: string | null;
  availabilityStatus: string;
  isDemo: boolean;
}

export interface ApiConsultation {
  id: string;
  expertId: string;
  questionId: string | null;
  message: string;
  status: string;
  createdAt: string;
  expert?: ApiExpert;
  question?: ApiQuestion | null;
}

export interface ApiProduct {
  id: string;
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

export interface ApiResource {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  reviewedAt: string | null;
}

export interface ApiDashboard {
  todaySleepMinutes: number;
  feedingsToday: ApiFeeding[];
  latestFeeding: ApiFeeding | null;
  recentDiapers: ApiDiaper[];
  latestHeight: ApiHeight | null;
  day: { start: string; end: string };
}

export interface ApiTimelineEvent {
  type: 'sleep' | 'feeding' | 'diaper' | 'question' | 'height' | 'milestone' | 'health';
  timestamp: string;
  data: Record<string, unknown>;
}

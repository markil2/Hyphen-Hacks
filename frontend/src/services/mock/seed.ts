import type {
  Activity,
  Baby,
  Consultation,
  DiaperEntry,
  Expert,
  FeedingEntry,
  HeightMeasurement,
  PediatricianNote,
  Preferences,
  Product,
  Question,
  RecordedMilestone,
  Resource,
  SavedItem,
  SleepSession,
} from '@/types';

/**
 * Offline demo data, used only when EXPO_PUBLIC_API_URL is not set.
 * All of it is fictional. Times are relative to "now" so there's always a believable day.
 */

const MIN = 60_000;
const DAY = 86_400_000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MIN).toISOString();

export const seedBaby = (): Baby => ({
  id: 'demo-baby',
  origin: 'demo',
  name: 'Robin',
  birthDate: new Date(Date.now() - DAY * (7 * 14 + 3)).toISOString(),
  sexAtBirth: 'not_recorded',
});

export const seedPreferences = (): Preferences => ({ reduceMotion: false, notifyFeedingReminders: false, notifyConsultUpdates: true });

export const seedSleep = (): SleepSession[] => [
  { id: 's1', origin: 'demo', startedAt: ago(250), endedAt: ago(178), notes: 'Settled after a short walk.' },
  { id: 's2', origin: 'demo', startedAt: ago(520), endedAt: ago(470) },
  { id: 's3', origin: 'demo', startedAt: ago(1180), endedAt: ago(960) },
  { id: 's4', origin: 'demo', startedAt: ago(1500), endedAt: ago(1420) },
  { id: 's5', origin: 'demo', startedAt: ago(2700), endedAt: ago(2520) },
  { id: 's6', origin: 'demo', startedAt: ago(4100), endedAt: ago(3850) },
];

export const seedFeedings = (): FeedingEntry[] => [
  { id: 'f1', origin: 'demo', at: ago(95), kind: 'breast', method: 'nursing', durationMin: 18 },
  { id: 'f2', origin: 'demo', at: ago(290), kind: 'formula', amountMl: 120 },
  { id: 'f3', origin: 'demo', at: ago(470), kind: 'breast', method: 'bottle', amountMl: 90 },
  { id: 'f4', origin: 'demo', at: ago(2900), kind: 'solid', food: 'Mashed banana' },
];

export const seedDiapers = (): DiaperEntry[] => [
  { id: 'd1', origin: 'demo', at: ago(60), kind: 'wet' },
  { id: 'd2', origin: 'demo', at: ago(230), kind: 'both' },
];

export const seedHeights = (): HeightMeasurement[] => [
  { id: 'h1', origin: 'demo', height: 62.1, unit: 'cm', measuredAt: ago(60 * 24 * 30) },
  { id: 'h2', origin: 'demo', height: 64.0, unit: 'cm', measuredAt: ago(60 * 24 * 2) },
];

export const seedMilestones = (): RecordedMilestone[] => [
  { id: 'm1', origin: 'demo', type: 'social', title: 'Smiled back at us', achievedAt: ago(60 * 24 * 40) },
];

export const seedQuestions = (): Question[] => [
  { id: 'q1', origin: 'demo', text: 'How do people usually handle the evening fussy stretch?', category: 'general', createdAt: ago(1600), status: 'submitted' },
];

export const seedConsultations = (): Consultation[] => [];

const demoExpert = (e: Omit<Expert, 'origin' | 'affiliationStatus' | 'availabilityStatus' | 'isDemo' | 'verificationStatus' | 'credentials'>): Expert => ({
  ...e,
  origin: 'demo',
  credentials: 'Fictional credentials — demo profile only',
  verificationStatus: 'demo_not_verified',
  affiliationStatus: 'external_unpartnered',
  availabilityStatus: 'demo_unknown',
  isDemo: true,
});

export const seedExperts = (): Expert[] => [
  demoExpert({ id: 'e1', name: 'Jordan Ellis', specialty: 'Lactation Consultant', serviceCategory: 'lactation', audience: 'family', description: 'Fictional profile used to show how the directory works offline.' }),
  demoExpert({ id: 'e2', name: 'Priya Natarajan', specialty: 'Infant Sleep Educator', serviceCategory: 'sleep', audience: 'family', description: 'Fictional profile used to show how the directory works offline.' }),
  demoExpert({ id: 'e3', name: 'Marisol Ortega', specialty: 'Pediatrician', serviceCategory: 'pediatrics', audience: 'baby_child', description: 'Fictional profile used to show how the directory works offline.' }),
];

export const seedProducts = (): Product[] => [
  {
    id: 'p1',
    origin: 'demo',
    name: 'Sample Infant Formula A',
    brand: 'Fictional Demo Brand',
    category: 'formula',
    description: 'Fictional sample record for interface testing; not a recommendation.',
    ingredients: 'Sample data — no real ingredient list is represented.',
    ageGuidance: 'Ask a pediatric professional whether any formula is appropriate for your infant.',
    sourceUrl: 'https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/',
    expertReviewStatus: 'not_reviewed',
    isSample: true,
  },
  {
    id: 'p2',
    origin: 'demo',
    name: 'Sample Single-Ingredient Cereal',
    brand: 'Fictional Demo Brand',
    category: 'solids',
    description: 'Fictional sample record for interface testing; not a recommendation.',
    ingredients: 'Sample data — no real ingredient list is represented.',
    ageGuidance: 'Developmental readiness varies; discuss introducing solids with a pediatric professional.',
    sourceUrl: 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-to-introduce-solid-foods.html',
    expertReviewStatus: 'not_reviewed',
    isSample: true,
  },
];

export const seedResources = (): Resource[] => [
  {
    id: 'r1',
    origin: 'demo',
    title: 'Safe Sleep Basics',
    category: 'sleep',
    description: 'Educational safe-sleep overview.',
    sourceName: 'American Academy of Pediatrics',
    sourceUrl: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
  },
  {
    id: 'r2',
    origin: 'demo',
    title: 'Infant Feeding Overview',
    category: 'feeding',
    description: 'General infant feeding education.',
    sourceName: 'CDC',
    sourceUrl: 'https://www.cdc.gov/infant-toddler-nutrition/',
  },
];

/* Device-only content — the backend has no equivalent, so this is used in both modes. */

export const seedSaved = (): SavedItem[] => [];

export const seedPediNotes = (): PediatricianNote[] => [
  { id: 'pn1', origin: 'demo', text: 'When is a good time to start offering water?', createdAt: ago(4000), context: 'Kitchen' },
];

export const seedActivities = (): Activity[] => [
  { id: 'a1', origin: 'demo', title: 'Narrate the nappy change', monthsFrom: 0, monthsTo: 6, minutes: 3, description: 'Describe what you are doing in a calm voice. A small, ordinary way to share words.' },
  { id: 'a2', origin: 'demo', title: 'Tummy time on your chest', monthsFrom: 0, monthsTo: 4, minutes: 5, description: 'Lie back and let your baby rest on your chest while awake and watched. Stop whenever either of you has had enough.' },
  { id: 'a3', origin: 'demo', title: 'Window watching', monthsFrom: 2, monthsTo: 8, minutes: 5, description: 'Hold your baby near a window and name what you can see: trees, a bus, the light.' },
  { id: 'a4', origin: 'demo', title: 'Reach for the ribbon', monthsFrom: 3, monthsTo: 7, minutes: 5, description: 'Hold a soft ribbon or cloth toy just within reach and let your baby swipe at it. Always supervised.' },
  { id: 'a5', origin: 'demo', title: 'Same board book, every day', monthsFrom: 0, monthsTo: 12, minutes: 5, description: 'Repetition is welcome. Point at the pictures and let your baby set the pace.' },
  { id: 'a6', origin: 'demo', title: 'Peekaboo with a muslin', monthsFrom: 5, monthsTo: 12, minutes: 3, description: 'Cover your face with a thin cloth and reappear. Watch for when your baby starts pulling it away.' },
];

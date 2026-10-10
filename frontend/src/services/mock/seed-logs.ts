import type {
  ActivityProgress,
  Consultation,
  DiaperEntry,
  FeedingEntry,
  PediatricianNote,
  Post,
  Profile,
  Question,
  SavedItem,
  SleepSession,
} from '@/types';

/**
 * Sample records for demo mode. All of it is fictional and is created relative
 * to "now" so the app always has a believable recent day to show.
 */

const MIN = 60_000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MIN).toISOString();

export const seedProfile = (): Profile => ({
  id: 'profile',
  origin: 'demo',
  parent: { name: 'Sam', role: 'Parent' },
  baby: {
    name: 'Robin',
    birthDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (7 * 14 + 3)).toISOString(),
    pronoun: 'they',
  },
  partnerName: 'Alex',
  preferences: {
    supportTopics: ['sleep', 'feeding'],
    contactMethods: ['chat', 'video'],
    notifyFeedingReminders: false,
    notifyConsultUpdates: true,
    notifyCommunityReplies: true,
    shareWithPartner: true,
    showInCommunity: false,
    reduceMotion: false,
  },
});

export const seedSleep = (): SleepSession[] => [
  { id: 's1', origin: 'demo', startedAt: ago(250), endedAt: ago(178), notes: 'Settled after a short walk.' },
  { id: 's2', origin: 'demo', startedAt: ago(520), endedAt: ago(470) },
  { id: 's3', origin: 'demo', startedAt: ago(1180), endedAt: ago(960) },
  { id: 's4', origin: 'demo', startedAt: ago(1500), endedAt: ago(1420), notes: 'Contact nap.' },
];

export const seedFeedings = (): FeedingEntry[] => [
  { id: 'f1', origin: 'demo', at: ago(95), kind: 'breast', method: 'nursing', side: 'left', durationMin: 18 },
  { id: 'f2', origin: 'demo', at: ago(290), kind: 'formula', amountMl: 120 },
  { id: 'f3', origin: 'demo', at: ago(470), kind: 'breast', method: 'bottle', amountMl: 90, notes: 'Alex gave this one.' },
  { id: 'f4', origin: 'demo', at: ago(1450), kind: 'breast', method: 'nursing', side: 'both', durationMin: 25 },
  { id: 'f5', origin: 'demo', at: ago(2900), kind: 'solid', food: 'Mashed banana', notes: 'Mostly curious about the spoon.' },
  { id: 'f6', origin: 'demo', at: ago(5800), kind: 'solid', food: 'Puréed sweet potato' },
];

export const seedDiapers = (): DiaperEntry[] => [
  { id: 'd1', origin: 'demo', at: ago(60), kind: 'wet' },
  { id: 'd2', origin: 'demo', at: ago(230), kind: 'both' },
  { id: 'd3', origin: 'demo', at: ago(410), kind: 'wet' },
];

export const seedQuestions = (): Question[] => [
  {
    id: 'q1',
    origin: 'demo',
    text: 'How do people usually handle the evening fussy stretch?',
    topic: 'soothing',
    createdAt: ago(1600),
    status: 'recorded',
  },
];

export const seedConsultations = (): Consultation[] => [];

export const seedSaved = (): SavedItem[] => [
  { id: 'sv1', origin: 'demo', kind: 'product', refId: 'p3', title: 'Example oat cereal', savedAt: ago(3000) },
];

export const seedPediNotes = (): PediatricianNote[] => [
  {
    id: 'pn1',
    origin: 'demo',
    text: 'When is a good time to start offering water?',
    createdAt: ago(4000),
    context: 'Kitchen',
  },
];

export const seedActivityProgress = (): ActivityProgress[] => [];

export const seedPosts = (): Post[] => [
  {
    id: 'c1',
    origin: 'demo',
    groupId: 'sleep',
    author: 'Sample parent',
    createdAt: ago(140),
    title: 'Small win: a 40-minute nap in the crib',
    body: 'It took a week of trying the same wind-down. Sharing in case anyone else needs to hear that the in-between weeks are normal.',
    replies: 6,
  },
  {
    id: 'c2',
    origin: 'demo',
    groupId: 'feeding',
    author: 'Sample parent',
    createdAt: ago(380),
    title: 'Combo feeding and feeling okay about it',
    body: 'We switched to a mix of nursing and formula this month. What helped you stop second-guessing?',
    replies: 11,
  },
  {
    id: 'c3',
    origin: 'demo',
    groupId: 'recovery',
    author: 'Sample parent',
    createdAt: ago(900),
    title: 'Who checked on you in the first weeks?',
    body: 'Trying to put together a list of people I can text at 3 a.m. Curious how others built theirs.',
    replies: 4,
  },
  {
    id: 'c4',
    origin: 'demo',
    groupId: 'firsts',
    author: 'Sample parent',
    createdAt: ago(2100),
    title: 'Favourite slow-morning activities?',
    body: 'Looking for gentle ideas for the hour after the first feed. We have been reading the same board book on repeat.',
    replies: 9,
  },
];

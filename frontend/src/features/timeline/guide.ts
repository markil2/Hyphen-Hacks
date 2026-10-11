/**
 * A calm, general "what usually happens when" guide for the first three years.
 * Timings are typical windows from public guidance (AAP, CDC), not deadlines.
 * Every baby is different; the screen says so and points to the pediatrician.
 */
export type GuideItem = {
  id: string;
  from: number; // months
  to: number; // months
  area: 'checkups' | 'feeding' | 'sleep' | 'play' | 'safety' | 'milestones';
  title: string;
  detail: string;
  source: 'AAP' | 'CDC';
};

export const GUIDE: GuideItem[] = [
  { id: 'newborn-visit', from: 0, to: 0.25, area: 'checkups', title: 'First pediatric visit', detail: 'Usually 3–5 days after birth, then again around 1 month.', source: 'AAP' },
  { id: 'back-to-sleep', from: 0, to: 12, area: 'sleep', title: 'Back to sleep, on a firm flat surface', detail: 'Alone, on the back, in a crib or bassinet with nothing else in it, for the first year.', source: 'AAP' },
  { id: 'tummy-time', from: 0, to: 6, area: 'play', title: 'Tummy time while awake', detail: 'Short, supervised sessions a few times a day, building up as your baby gets stronger.', source: 'AAP' },
  { id: 'feed-on-cue', from: 0, to: 6, area: 'feeding', title: 'Milk only, fed on cue', detail: 'Breast milk or formula is all babies need for about the first 6 months.', source: 'AAP' },
  { id: 'visit-2m', from: 2, to: 2.5, area: 'checkups', title: '2-month checkup and vaccines', detail: 'Checkups usually follow at 4, 6, 9, 12, 15 and 18 months.', source: 'CDC' },
  { id: 'social-smile', from: 1.5, to: 3, area: 'milestones', title: 'First social smiles', detail: 'Many babies smile back at you around 2 months.', source: 'CDC' },
  { id: 'visit-4m', from: 4, to: 4.5, area: 'checkups', title: '4-month checkup and vaccines', detail: 'A good time to ask about readiness for solid food.', source: 'CDC' },
  { id: 'rolling', from: 4, to: 6, area: 'milestones', title: 'Rolling over', detail: 'Often from tummy to back first. Keep a hand on your baby on raised surfaces.', source: 'CDC' },
  { id: 'solids', from: 6, to: 7, area: 'feeding', title: 'Starting solid foods', detail: 'Around 6 months, when your baby sits with support and shows interest. Milk is still the main food.', source: 'AAP' },
  { id: 'allergens', from: 6, to: 8, area: 'feeding', title: 'Introducing common allergens', detail: 'Foods like peanut and egg are often introduced early, one at a time. Ask your pediatrician first, especially with eczema.', source: 'AAP' },
  { id: 'babyproof', from: 5, to: 8, area: 'safety', title: 'Babyproof before crawling', detail: 'Anchor furniture, cover outlets, gate stairs, and move small objects and cleaners out of reach.', source: 'AAP' },
  { id: 'visit-6m', from: 6, to: 6.5, area: 'checkups', title: '6-month checkup and vaccines', detail: 'Many families also schedule a first dental visit when the first tooth appears.', source: 'AAP' },
  { id: 'sitting', from: 6, to: 9, area: 'milestones', title: 'Sitting without support', detail: 'Usually somewhere between 6 and 9 months.', source: 'CDC' },
  { id: 'crawling', from: 7, to: 11, area: 'milestones', title: 'Crawling or scooting', detail: 'Some babies skip crawling altogether, and that can be fine.', source: 'CDC' },
  { id: 'cup', from: 6, to: 12, area: 'feeding', title: 'Practising with an open cup', detail: 'Small sips of water with meals, with help.', source: 'AAP' },
  { id: 'visit-9m', from: 9, to: 9.5, area: 'checkups', title: '9-month checkup', detail: 'Includes a developmental screening.', source: 'AAP' },
  { id: 'first-words', from: 10, to: 14, area: 'milestones', title: 'First words', detail: 'Often "mama" or "dada" with meaning, around the first birthday.', source: 'CDC' },
  { id: 'whole-milk', from: 12, to: 13, area: 'feeding', title: 'Moving to whole cow’s milk', detail: 'Usually around 12 months, if your pediatrician agrees.', source: 'AAP' },
  { id: 'walking', from: 9, to: 18, area: 'milestones', title: 'First steps', detail: 'Anywhere from about 9 to 18 months is common.', source: 'CDC' },
  { id: 'visit-12m', from: 12, to: 12.5, area: 'checkups', title: '12-month checkup and vaccines', detail: 'Then 15 and 18 months, and 2 years.', source: 'CDC' },
  { id: 'bottle-weaning', from: 12, to: 18, area: 'feeding', title: 'Moving from bottle to cup', detail: 'Many families phase out bottles between 12 and 18 months.', source: 'AAP' },
  { id: 'screens', from: 0, to: 18, area: 'play', title: 'Little to no screen time', detail: 'Video calls with family are the usual exception before 18 months.', source: 'AAP' },
  { id: 'autism-screen', from: 18, to: 24, area: 'checkups', title: '18- and 24-month screenings', detail: 'Routine developmental and autism screenings at these visits.', source: 'AAP' },
  { id: 'toddler-bed', from: 18, to: 36, area: 'sleep', title: 'Crib to toddler bed', detail: 'Often when your child is about 35 inches tall or starts climbing out, usually between 18 months and 3½ years.', source: 'AAP' },
  { id: 'two-words', from: 20, to: 26, area: 'milestones', title: 'Putting two words together', detail: 'Like “more milk”, around 2 years.', source: 'CDC' },
  { id: 'potty', from: 18, to: 36, area: 'milestones', title: 'Potty readiness', detail: 'Most children show signs of readiness between 18 months and 3 years. There’s no rush.', source: 'AAP' },
];

export const AREA_LABEL: Record<GuideItem['area'], string> = {
  checkups: 'Checkups',
  feeding: 'Feeding',
  sleep: 'Sleep',
  play: 'Play',
  safety: 'Safety',
  milestones: 'Milestones',
};

/** Split the guide into what's happening now, what's coming up soon, and what's behind you. */
export function guideFor(months: number) {
  const now = GUIDE.filter((g) => months >= g.from && months <= g.to);
  const soon = GUIDE.filter((g) => g.from > months && g.from <= months + 3).sort((a, b) => a.from - b.from);
  const later = GUIDE.filter((g) => g.from > months + 3).sort((a, b) => a.from - b.from);
  const past = GUIDE.filter((g) => g.to < months).sort((a, b) => b.to - a.to);
  return { now, soon, later, past };
}

export const windowLabel = (g: GuideItem) => {
  const f = (m: number) => (m < 1 ? (m === 0 ? 'birth' : `${Math.round(m * 4)} wk`) : `${Math.round(m)} mo`);
  return g.to - g.from <= 0.6 ? `around ${f(g.from)}` : `${f(g.from)} – ${f(g.to)}`;
};

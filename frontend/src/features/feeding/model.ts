import { useMemo } from 'react';

import { isToday } from '@/lib/time';
import { stores, useCollection } from '@/state';
import type { FeedingEntry } from '@/types';

import type { IconName } from '@/components/icons';

export function useFeedings() {
  const feedings = useCollection(stores.feedings);
  const today = useMemo(() => feedings.items.filter((f) => isToday(f.at)), [feedings.items]);
  const milkToday = today.filter((f) => f.kind !== 'solid');
  const solids = useMemo(() => feedings.items.filter((f): f is Extract<FeedingEntry, { kind: 'solid' }> => f.kind === 'solid'), [feedings.items]);
  const lastMilk = feedings.items.find((f) => f.kind !== 'solid') ?? null;
  return { ...feedings, today, milkToday, solids, lastMilk };
}

export function feedingTitle(f: FeedingEntry) {
  switch (f.kind) {
    case 'breast':
      return f.method === 'nursing' ? 'Nursing' : 'Breast milk, by bottle';
    case 'formula':
      return 'Formula';
    case 'solid':
      return f.food;
  }
}

export function feedingDetail(f: FeedingEntry) {
  const parts: string[] = [];
  if (f.kind === 'breast' && f.method === 'nursing') {
    if (f.side) parts.push(f.side === 'both' ? 'both sides' : `${f.side} side`);
    if (f.durationMin) parts.push(`${f.durationMin} min`);
  }
  if ((f.kind === 'formula' || (f.kind === 'breast' && f.method === 'bottle')) && f.amountMl) parts.push(`${f.amountMl} ml`);
  if (f.kind === 'solid') parts.push('Solids');
  return parts.join(' · ');
}

export function feedingIcon(f: FeedingEntry): IconName {
  return f.kind === 'solid' ? 'bowl' : f.kind === 'breast' && f.method === 'nursing' ? 'heart' : 'bottle';
}

export const mlToOz = (ml: number) => Math.round((ml / 29.57) * 10) / 10;

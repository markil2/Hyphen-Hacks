import { useMemo } from 'react';

import { isToday } from '@/lib/time';
import { stores, useCollection } from '@/state';
import type { DiaperKind } from '@/types';

export const diaperLabel: Record<DiaperKind, string> = { wet: 'Wet', dirty: 'Dirty', both: 'Wet + dirty' };

export function useDiapers() {
  const diapers = useCollection(stores.diapers);
  const today = useMemo(() => diapers.items.filter((d) => isToday(d.at)), [diapers.items]);
  return { ...diapers, today };
}

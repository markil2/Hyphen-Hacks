import { useMemo } from 'react';

import { stores, useCollection } from '@/state';
import { isToday } from '@/lib/time';
import type { SleepSession } from '@/types';

/** Sleep sessions plus the one derived fact everything needs: is a session running? */
export function useSleep() {
  const sleep = useCollection(stores.sleep);
  const active = useMemo(() => sleep.items.find((s) => !s.endedAt) ?? null, [sleep.items]);
  const completed = useMemo(() => sleep.items.filter((s) => s.endedAt), [sleep.items]);
  const today = useMemo(() => completed.filter((s) => isToday(s.endedAt!)), [completed]);
  const todayTotalMs = today.reduce((sum, s) => sum + durationOf(s), 0);

  return {
    ...sleep,
    active,
    completed,
    today,
    todayTotalMs,
    start: () => sleep.create({ startedAt: new Date().toISOString(), endedAt: null }, 'start'),
    end: (id: string) => sleep.update(id, { endedAt: new Date().toISOString() }),
    starting: sleep.isBusy('start'),
  };
}

export function durationOf(s: SleepSession, now = Date.now()) {
  const end = s.endedAt ? new Date(s.endedAt).getTime() : now;
  return Math.max(0, end - new Date(s.startedAt).getTime());
}

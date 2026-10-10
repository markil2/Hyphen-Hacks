import { router } from 'expo-router';
import { useState, useSyncExternalStore } from 'react';

import { haptic } from '@/lib/haptics';
import { ApiError } from '@/services/api/client';
import { messageOf } from '@/state/store';

import { useSleep } from './useSleep';

// Which completed session to confirm, shared by the nursery and the monitor.
let justEndedId: string | null = null;
const listeners = new Set<() => void>();
const setJustEnded = (id: string | null) => {
  justEndedId = id;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Start / end / confirm logic for a sleep session, independent of where the controls live. */
export function useSessionFlow() {
  const sleep = useSleep();
  const endedId = useSyncExternalStore(subscribe, () => justEndedId, () => justEndedId);
  const [error, setError] = useState<string | null>(null);
  const justEnded = sleep.items.find((s) => s.id === endedId && s.endedAt) ?? null;
  const ending = sleep.active ? sleep.isBusy(`update:${sleep.active.id}`) : false;

  const start = async () => {
    setError(null);
    setJustEnded(null);
    try {
      await sleep.start();
      haptic.success();
    } catch (e) {
      // Another device (or a double tap) already started one: show the real state instead of an error.
      if (e instanceof ApiError && e.code === 'SLEEP_ALREADY_ACTIVE') {
        await sleep.retry();
        return;
      }
      setError(messageOf(e));
    }
  };

  const end = async () => {
    if (!sleep.active) return;
    setError(null);
    try {
      const done = await sleep.end(sleep.active.id);
      setJustEnded(done.id);
      haptic.success();
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return {
    sleep,
    active: sleep.active,
    justEnded,
    busy: sleep.starting || ending,
    error,
    toggle: () => (sleep.active ? end() : start()),
    start,
    end,
    dismiss: () => setJustEnded(null),
    edit: (id: string) => router.push({ pathname: '/nursery/edit', params: { id } }),
  };
}

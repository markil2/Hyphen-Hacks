import { DAY, startOfDay } from '@/lib/time';
import type { SleepSession } from '@/types';

/**
 * Plain arithmetic over logged sessions — no scoring, no targets, no judgments.
 * A session counts toward the day it started in.
 */

const minutesOf = (s: SleepSession, now: number) =>
  Math.max(0, ((s.endedAt ? new Date(s.endedAt).getTime() : now) - new Date(s.startedAt).getTime()) / 60000);

export interface DayTotal {
  dayStart: number;
  minutes: number;
  label: string;
}

export interface SleepStats {
  todayMinutes: number;
  todayCount: number;
  longestTodayMinutes: number;
  lastWokeAt: string | null;
  week: DayTotal[];
  weekAverageMinutes: number;
}

export function sleepStats(sessions: SleepSession[], now = Date.now()): SleepStats {
  const today = startOfDay(now);
  const completed = sessions.filter((s) => s.endedAt);
  const todays = completed.filter((s) => new Date(s.startedAt).getTime() >= today);
  const lastWoke = completed.map((s) => s.endedAt!).sort().at(-1) ?? null;

  const week: DayTotal[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = today - i * DAY;
    const minutes = completed
      .filter((s) => {
        const t = new Date(s.startedAt).getTime();
        return t >= dayStart && t < dayStart + DAY;
      })
      .reduce((sum, s) => sum + minutesOf(s, now), 0);
    const label = i === 0 ? 'Today' : new Date(dayStart).toLocaleDateString(undefined, { weekday: 'short' });
    week.push({ dayStart, minutes: Math.round(minutes), label });
  }
  const logged = week.filter((d) => d.minutes > 0);

  return {
    todayMinutes: Math.round(todays.reduce((sum, s) => sum + minutesOf(s, now), 0)),
    todayCount: todays.length,
    longestTodayMinutes: Math.round(Math.max(0, ...todays.map((s) => minutesOf(s, now)))),
    lastWokeAt: lastWoke,
    week,
    weekAverageMinutes: logged.length ? Math.round(logged.reduce((s, d) => s + d.minutes, 0) / logged.length) : 0,
  };
}

export const hm = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
};

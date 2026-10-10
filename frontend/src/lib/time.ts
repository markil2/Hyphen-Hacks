import { useEffect, useState } from 'react';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Re-renders on an interval so derived values (elapsed time) stay current. */
export function useNow(intervalMs = 1000, enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
  return now;
}

export function formatClock(iso: string | number | Date) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${suffix}`;
}

/** "1 h 12 min", "48 min", "under a minute". */
export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / MIN));
  if (total < 1) return 'under a minute';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Stopwatch style for a live session: 1:04:09 or 12:09. */
export function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function startOfDay(t: number | Date = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isToday(iso: string) {
  return new Date(iso).getTime() >= startOfDay();
}

export function dayLabel(iso: string) {
  const t = new Date(iso).getTime();
  const today = startOfDay();
  if (t >= today) return 'Today';
  if (t >= today - DAY) return 'Yesterday';
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function relativeTime(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime();
  if (diff < MIN) return 'just now';
  if (diff < HOUR) return `${Math.round(diff / MIN)} min ago`;
  if (diff < DAY) {
    const h = Math.round(diff / HOUR);
    return `${h} h ago`;
  }
  return dayLabel(iso);
}

export function slotLabel(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return `${day} · ${formatClock(d)}`;
}

/** "14 weeks", "5 months" — approximate, for display only. */
export function babyAge(birthIso: string, now = Date.now()) {
  const days = Math.floor((now - new Date(birthIso).getTime()) / DAY);
  if (days < 0) return 'Not born yet';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} old`;
  const weeks = Math.floor(days / 7);
  if (weeks < 16) return `${weeks} weeks old`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} months old`;
  return `${Math.floor(months / 12)} years old`;
}

export function ageInMonths(birthIso: string, now = Date.now()) {
  return (now - new Date(birthIso).getTime()) / (DAY * 30.44);
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Up in the small hours';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Shift an ISO time by whole minutes, never into the future. */
export function shiftMinutes(iso: string, minutes: number, notAfter = Date.now()) {
  const next = new Date(iso).getTime() + minutes * MIN;
  return new Date(Math.min(next, notAfter)).toISOString();
}

/** Shift an ISO date by whole days, never into the future. */
export function shiftDays(iso: string, days: number, notAfter = Date.now()) {
  return new Date(Math.min(notAfter, new Date(iso).getTime() + days * DAY)).toISOString();
}

export { DAY, HOUR, MIN };

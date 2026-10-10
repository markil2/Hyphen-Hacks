import type { Session } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';

import { authEnabled, supabase } from '@/lib/supabase';
import { dataMode, remote } from '@/services';
import { resetAccountData } from '@/state';
import { messageOf } from '@/state/store';

/**
 * Who is using the app, and what they need next:
 * - `signedOut`: show sign in / sign up
 * - `needsBaby`: signed in, but no baby profile yet → onboarding
 * - `ready`: the app itself (signed in, or exploring the demo)
 */
export type Phase = 'loading' | 'signedOut' | 'needsBaby' | 'ready';

interface AuthState {
  session: Session | null;
  sessionLoaded: boolean;
  /** Exploring without an account (only when the server allows demo mode). */
  demo: boolean;
  serverDemoMode: boolean;
  babies: 'unknown' | 'none' | 'some' | 'error';
  babiesError?: string;
}

let state: AuthState = { session: null, sessionLoaded: !authEnabled, demo: false, serverDemoMode: false, babies: 'unknown' };
const listeners = new Set<() => void>();
const set = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function phaseOf(s: AuthState): Phase {
  if (!authEnabled || dataMode === 'demo') return 'ready';
  if (!s.sessionLoaded) return 'loading';
  if (!s.session) return s.demo ? 'ready' : 'signedOut';
  if (s.babies === 'unknown') return 'loading';
  if (s.babies === 'none') return 'needsBaby';
  return 'ready';
}

async function checkBabies() {
  set({ babies: 'unknown', babiesError: undefined });
  try {
    const babies = await remote.babies.list();
    set({ babies: babies.length ? 'some' : 'none' });
  } catch (e) {
    // Let the app open; its screens show the connection error and a retry.
    set({ babies: 'error', babiesError: messageOf(e) });
  }
}

/** A different person (or nobody) is now using the app: drop everything cached for the last one. */
function switchUser(session: Session | null) {
  const changed = session?.user.id !== state.session?.user.id;
  set({ session, sessionLoaded: true });
  if (!changed) return;
  remote.resetSession();
  resetAccountData();
  if (session) checkBabies();
  else set({ babies: 'unknown' });
}

let started = false;
export function startAuth() {
  if (started || !supabase) return;
  started = true;
  remote.health().then(
    (h) => set({ serverDemoMode: h.demoMode }),
    () => set({ serverDemoMode: false }),
  );
  supabase.auth.getSession().then(({ data }) => switchUser(data.session));
  supabase.auth.onAuthStateChange((_event, session) => switchUser(session));
}

export function useAuth() {
  const s = useSyncExternalStore(subscribe, () => state, () => state);
  return { ...s, phase: phaseOf(s), enabled: authEnabled };
}

export const authActions = {
  enterDemo() {
    remote.resetSession();
    resetAccountData();
    set({ demo: true });
  },
  leaveDemo() {
    remote.resetSession();
    resetAccountData();
    set({ demo: false });
  },
  babyCreated() {
    resetAccountData();
    set({ babies: 'some' });
  },
  async signOut() {
    set({ demo: false });
    await supabase?.auth.signOut();
  },
};

/** Supabase's error messages, rewritten for a tired parent. */
export function authMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const lower = raw.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'That email and password don’t match. Check them and try again.';
  if (lower.includes('email not confirmed')) return 'Please confirm your email first — the link is in your inbox.';
  if (lower.includes('already registered') || lower.includes('already been registered')) return 'There’s already an account with this email. Try signing in instead.';
  if (lower.includes('password should be at least') || lower.includes('weak password')) return 'Choose a longer password (at least 8 characters).';
  if (lower.includes('rate limit') || lower.includes('too many')) return 'Too many attempts just now. Wait a minute and try again.';
  if (lower.includes('token has expired') || lower.includes('otp') || lower.includes('invalid token')) return 'That code didn’t work or has expired. Request a new one.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Can’t reach the sign-in service. Check your connection and try again.';
  return raw || 'Something went wrong. Please try again.';
}

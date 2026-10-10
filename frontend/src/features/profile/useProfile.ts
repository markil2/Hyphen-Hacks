import { stores, useDoc } from '@/state';
import type { Preferences, Profile } from '@/types';

export function useProfile() {
  const doc = useDoc(stores.profile);
  const value = doc.value;
  return {
    ...doc,
    profile: value,
    setPreference: <K extends keyof Preferences>(key: K, v: Preferences[K]) =>
      value ? doc.save({ ...value, preferences: { ...value.preferences, [key]: v } }) : undefined,
    update: (patch: Partial<Profile>) => (value ? doc.save({ ...value, ...patch }) : undefined),
  };
}

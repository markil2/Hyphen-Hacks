import { stores, useDoc } from '@/state';

const MONTH = 30.4375 * 86_400_000;

/** Whole months since birth (0 for newborns, never negative). */
export const ageInMonths = (birthIso: string, now = Date.now()) => Math.max(0, Math.floor((now - new Date(birthIso).getTime()) / MONTH));

/** A birth date that makes the baby `months` old today (used by the demo age slider). */
export const birthDateForMonths = (months: number, now = Date.now()) => new Date(now - months * MONTH - 86_400_000).toISOString();

/** When parts of the house appear. Solids are usually introduced around 6 months. */
export const AGE_GATES = { solids: 6 } as const;

/** The baby's age in months, or null until the profile loads. */
export function useBabyMonths() {
  const baby = useDoc(stores.baby);
  return baby.value ? ageInMonths(baby.value.birthDate) : null;
}

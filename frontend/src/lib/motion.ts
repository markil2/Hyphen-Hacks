import { Easing, useReducedMotion } from 'react-native-reanimated';

import { stores } from '@/state';
import { useDoc } from '@/state/store';

/** True when either the OS or the in-app preference asks for less motion. */
export function useCalmMotion() {
  const system = useReducedMotion();
  const { value } = useDoc(stores.profile);
  return system || Boolean(value?.preferences.reduceMotion);
}

/** Exponential ease-out: quick to respond, soft to settle. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

import { createContext, useContext } from 'react';
import type { GestureType } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';

export const PAGES = { home: 0, rooms: 1, settings: 2 } as const;
export type PageName = keyof typeof PAGES;

export const ROOM_ORDER = ['nursery', 'kitchen', 'living', 'changing', 'play'] as const;
export type RoomId = (typeof ROOM_ORDER)[number];

export interface PagerApi {
  /** 0 = Home (above), 1 = Rooms (middle), 2 = Settings (below). */
  page: number;
  room: number;
  goTo: (page: PageName) => void;
  goToRoom: (room: RoomId | number) => void;
  /** Lock swiping while something modal-ish is open (e.g. the baby monitor). */
  setLocked: (locked: boolean) => void;
  /** The pager's own pans, so inner gestures (the lamp chain) can block them. */
  pans: GestureType[];
  progress: { page: SharedValue<number>; room: SharedValue<number> };
}

export const PagerContext = createContext<PagerApi | null>(null);

export function usePager() {
  const ctx = useContext(PagerContext);
  if (!ctx) throw new Error('usePager must be used inside the home pager');
  return ctx;
}

/** Same as usePager, but safe outside the pager (returns null). */
export const useOptionalPager = () => useContext(PagerContext);

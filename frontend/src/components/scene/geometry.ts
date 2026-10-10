import { createContext, useContext } from 'react';

/** Every room is drawn on the same 390 × 760 canvas, from the same high camera. */
export const DESIGN_W = 390;
export const DESIGN_H = 760;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });

/** Scale from design units to screen points, shared with anything placed on the stage. */
export const StageContext = createContext({ s: 1 });
export const useStage = () => useContext(StageContext);

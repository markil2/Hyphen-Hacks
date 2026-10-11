import { useEffect, useState } from 'react';
import { G, Rect } from 'react-native-svg';

import { useBabyMonths } from '@/lib/age';
import { useCalmMotion } from '@/lib/motion';
import { stores, useCollection } from '@/state';

/**
 * A little pixel-art baby on its back in the crib. It grows with the baby's age: more hair,
 * a t-shirt from 12 months, and out of diapers into shorts from about 30 months. Purely decorative:
 * every so often it does a tiny snow-angel dance (arms sweep, feet kick), and now and
 * then it smirks. Eyes close while a sleep session runs, and the dancing stops.
 */

const P = 2.6;
/** The crib's long rails fall about 8° left to right; the baby lies along them. */
const CRIB_SLANT = 8.3; // one "pixel" in design units
const SKIN = '#F0CDAE';
const SKIN_SHADE = '#DFB592';
const HAIR = '#6E4E36';
const DIAPER = '#F8F4EC';
const DIAPER_SHADE = '#E3DCCD';
const TAB = '#A9B9C6';
const INK = '#2E2018';
const LIP = '#B0705A';
const BLUSH = '#F2A49C';

type Arms = 'up' | 'out' | 'down';
const ARM: Record<Arms, [number, number][]> = {
  up: [[4, 10], [3, 9], [2, 8], [1, 7]],
  out: [[4, 11], [3, 11], [2, 11], [1, 11]],
  down: [[4, 12], [3, 13], [2, 14], [1, 15]],
};
const DANCE: Arms[] = ['out', 'up', 'out', 'down', 'out', 'up', 'out', 'down', 'out', 'up'];

function px(c: number, r: number, fill: string, w = 1, h = 1, o = 1, key?: string) {
  return <Rect key={key ?? `${c}-${r}-${fill}`} x={c * P} y={r * P} width={w * P + 0.04} height={h * P + 0.04} fill={fill} opacity={o} />;
}

function Head({ stage }: { stage: number }) {
  const out = [];
  for (let r = 1; r <= 9; r++) {
    for (let c = 3; c <= 13; c++) {
      if (((c - 8) / 4.6) ** 2 + ((r - 5) / 4.3) ** 2 > 1) continue;
      // More hair as the baby grows: a tuft, then a fuller cap, then a toddler's mop.
      const hair = r <= 1 + stage || (r === 2 + stage && Math.abs(c - 8) >= 3) || (stage === 2 && r <= 6 && Math.abs(c - 8) >= 4);
      out.push(px(c, r, hair ? HAIR : SKIN));
    }
  }
  // a little curl on top
  out.push(px(8, 0, HAIR), px(9, -0.6, HAIR, 0.8, 0.8));
  return <G>{out}</G>;
}

const SHIRT = '#A9B9C6';
const SHIRT_SHADE = '#94A8B9';
const SHORTS = '#879783';
const SHORTS_SHADE = '#6F7D6B';

/** Stage 0: just a diaper. Stage 1: a little t-shirt over the diaper. Stage 2: out of diapers, t-shirt and shorts. */
function Body({ stage }: { stage: number }) {
  const out = [];
  for (let r = 10; r <= 13; r++) for (let c = 5; c <= 11; c++) out.push(px(c, r, stage ? (c === 5 || c === 11 ? SHIRT_SHADE : SHIRT) : SKIN));
  if (stage) out.push(px(7, 10, '#F8F4EC', 3, 0.5, 0.8, 'collar'));
  else out.push(px(8, 12.4, SKIN_SHADE, 0.6, 0.6, 1, 'belly'));
  if (stage < 2) {
    for (let c = 5; c <= 11; c++) out.push(px(c, 14, DIAPER), px(c, 15, c === 5 || c === 11 ? DIAPER_SHADE : DIAPER));
    for (let c = 6; c <= 10; c++) out.push(px(c, 16, DIAPER_SHADE));
    out.push(px(5, 14, TAB, 1, 0.8, 1, 'tabL'), px(11, 14, TAB, 1, 0.8, 1, 'tabR'));
  } else {
    for (let c = 5; c <= 11; c++) out.push(px(c, 14, SHORTS), px(c, 15, c === 8 ? SHORTS_SHADE : SHORTS));
  }
  return <G>{out}</G>;
}

function Arm({ pose, mirror }: { pose: Arms; mirror?: boolean }) {
  const pts = ARM[pose];
  return (
    <G>
      {pts.map(([c, r], i) => {
        const x = mirror ? 16 - c : c;
        const hand = i === pts.length - 1;
        return px(hand ? x - 0.15 : x, hand ? r - 0.15 : r, SKIN, hand ? 1.3 : 1, hand ? 1.3 : 1, 1, `a${mirror ? 'r' : 'l'}${i}`);
      })}
    </G>
  );
}

function Leg({ col, long, nudge, stage }: { col: number; long: boolean; nudge: number; stage: number }) {
  const top = stage === 2 ? 16 : 17;
  const len = (long ? 3 : 2) + stage;
  const out = [];
  for (let i = 0; i < len; i++) out.push(px(col, top + i, SKIN, 2, 1, 1, `l${col}-${i}`));
  out.push(px(col + nudge, top + len, SKIN_SHADE, 2, 1, 1, `f${col}`));
  return <G>{out}</G>;
}

export function PixelBaby({ x, y }: { x: number; y: number }) {
  const sleep = useCollection(stores.sleep);
  const asleep = sleep.items.some((s) => !s.endedAt);
  const calm = useCalmMotion();
  const months = useBabyMonths() ?? 0;
  // Grows from newborn size to toddler size over the first two years.
  const grow = 0.82 + (0.4 * Math.min(months, 24)) / 24;
  const stage = months >= 30 ? 2 : months >= 12 ? 1 : 0;
  const [smirk, setSmirk] = useState(false);
  const [frame, setFrame] = useState(-1); // -1 = resting

  // Occasional smirk.
  useEffect(() => {
    let off: ReturnType<typeof setTimeout> | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setSmirk(true);
        off = setTimeout(() => setSmirk(false), 1400);
        schedule();
      }, 6000 + Math.random() * 6000);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(off);
    };
  }, []);

  // Occasional little dance while awake.
  useEffect(() => {
    if (asleep || calm) return;
    let step: ReturnType<typeof setInterval> | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        let i = 0;
        step = setInterval(() => {
          if (i >= DANCE.length) {
            clearInterval(step);
            setFrame(-1);
            schedule();
            return;
          }
          setFrame(i++);
        }, 190);
      }, 4000 + Math.random() * 6000);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      clearInterval(step);
      setFrame(-1);
    };
  }, [asleep, calm]);

  const dancing = frame >= 0 && !asleep;
  const arms: Arms = dancing ? DANCE[frame] : 'down';
  const kick = dancing ? frame % 2 === 0 : false;

  const eye = (c: number) =>
    asleep ? (
      <G key={`e${c}`}>
        {px(c - 0.2, 5.6, '#4A3626', 1.4, 0.4)}
        {px(c - 0.35, 5.3, '#4A3626', 0.4, 0.4)}
        {px(c + 0.95, 5.3, '#4A3626', 0.4, 0.4)}
      </G>
    ) : (
      <G key={`e${c}`}>
        {px(c, 4.6, INK, 1.1, 1.5)}
        {px(c + 0.1, 4.7, '#FFFFFF', 0.45, 0.45, 0.9)}
      </G>
    );

  return (
    // Drawn head-up, then laid lengthwise (head toward the left end) and slanted with the crib.
    <G transform={`translate(${x} ${y + (1 - grow) * 8 * P}) skewY(${CRIB_SLANT}) scale(${grow}) translate(0 ${17 * P}) rotate(-90)`}>
      <Arm pose={arms} />
      <Arm pose={arms} mirror />
      <Leg col={6} long={dancing ? kick : true} nudge={dancing ? (kick ? -0.4 : 0.3) : 0} stage={stage} />
      <Leg col={9} long={dancing ? !kick : true} nudge={dancing ? (kick ? 0.3 : -0.4) : 0} stage={stage} />
      <Body stage={stage} />
      <Head stage={stage} />
      {eye(5.9)}
      {eye(9.9)}
      {px(4.8, 6.6, BLUSH, 1.4, 0.9, 0.75)}
      {px(10.8, 6.6, BLUSH, 1.4, 0.9, 0.75)}
      {smirk || dancing ? (
        <G>
          {px(7.4, 7.5, LIP, 1.6, 0.45)}
          {px(9.0, 7.1, LIP, 0.6, 0.45)}
        </G>
      ) : (
        <G>
          {px(7.6, 7.5, LIP, 1.2, 0.45)}
          {px(7.3, 7.25, LIP, 0.4, 0.4)}
          {px(8.7, 7.25, LIP, 0.4, 0.4)}
        </G>
      )}
    </G>
  );
}

import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { useBabyMonths } from '@/lib/age';

import { PixelBaby } from './PixelBaby';
import { ambientDefs, BaseShadow, ContactShadow, FootDot, Footprint, glowGradient, Quad, shadowGradient, Shell, Vignette, wallGradient, wood } from './shared';

/**
 * The nursery at night, composed after the reference render:
 * crib on the left, a nightstand with a glowing lamp, a quiet carpet, and the baby asleep or awake in the crib.
 */

// Crib geometry (oblique): back face sits up-and-right of the front face.
const FRONT = { x0: 18, y0: 338, x1: 196, y1: 364 };
const BACK = { x0: 40, y0: 256, x1: 218, y1: 282 };
const yFront = (x: number) => FRONT.y0 + ((x - FRONT.x0) * (FRONT.y1 - FRONT.y0)) / (FRONT.x1 - FRONT.x0);
const yBack = (x: number) => BACK.y0 + ((x - BACK.x0) * (BACK.y1 - BACK.y0)) / (BACK.x1 - BACK.x0);
const RAIL_H = 98;

/** A little whiteboard above the nightstand: a marker timeline with a dot at the baby's age. */
function Whiteboard() {
  const months = useBabyMonths() ?? 0;
  const k = 0.133; // wall slope
  const x0 = 230;
  const x1 = 296;
  const y = (x: number, base: number) => base + (x - 226) * k;
  const at = (m: number) => x0 + ((x1 - x0) * Math.min(m, 36)) / 36;
  return (
    <G>
      <Quad p={[[223, y(223, 192)], [301, y(301, 192)], [301, y(301, 250)], [223, y(223, 250)]]} fill="#B7AA94" />
      <Quad p={[[226, y(226, 195)], [298, y(298, 195)], [298, y(298, 247)], [226, y(226, 247)]]} fill="#F4F1EA" />
      <Quad p={[[226, y(226, 195)], [298, y(298, 195)], [298, y(298, 199)], [226, y(226, 199)]]} fill="#FFFFFF" opacity={0.7} />
      {/* scribbled notes */}
      <Path d={`M232 ${y(232, 205)} l18 ${18 * k} M232 ${y(232, 210)} l12 ${12 * k}`} stroke="#879783" strokeWidth={1.4} strokeLinecap="round" />
      <Path d={`M262 ${y(262, 205)} l24 ${24 * k}`} stroke="#B9826B" strokeWidth={1.4} strokeLinecap="round" />
      {/* the timeline */}
      <Path d={`M${x0} ${y(x0, 231)} L${x1} ${y(x1, 231)}`} stroke="#4A4238" strokeWidth={1.4} strokeLinecap="round" />
      {[0, 6, 12, 18, 24, 36].map((m) => (
        <Path key={m} d={`M${at(m)} ${y(at(m), 228)} v6`} stroke="#4A4238" strokeWidth={1.2} />
      ))}
      <Circle cx={at(months)} cy={y(at(months), 231)} r={3.4} fill="#B9826B" />
      <Path d={`M${at(months)} ${y(at(months), 225)} l-2 -4 h4 Z`} fill="#B9826B" />
      {/* marker tray */}
      <Quad p={[[230, y(230, 250)], [294, y(294, 250)], [294, y(294, 253)], [230, y(230, 253)]]} fill="#A99C86" />
      <SvgRect x={260} y={y(260, 246)} width={10} height={3} rx={1.5} fill="#55634F" />
    </G>
  );
}

export const NURSERY = {
  crib: rect(8, 240, 222, 232),
  lampShade: rect(236, 276, 38, 44),
  /** Where the pull chain hangs from (design units). */
  chainAnchor: { x: 266, y: 317 },
  nightstand: rect(222, 300, 70, 96),
  whiteboard: rect(220, 186, 84, 74),
};

function Rail({ x0, y0, x1, y1, t = 6, top = wood.top, face = wood.face }: { x0: number; y0: number; x1: number; y1: number; t?: number; top?: string; face?: string }) {
  return (
    <G>
      <Quad p={[[x0, y0 - 2], [x1, y1 - 2], [x1 + 3, y1 - 4], [x0 + 3, y0 - 4]]} fill={top} />
      <Quad p={[[x0, y0 - 2], [x1, y1 - 2], [x1, y1 + t], [x0, y0 + t]]} fill={face} />
    </G>
  );
}

/** From 2 years the crib becomes a low toddler bed (usually 18 months – 3½ years). */
export const TODDLER_BED_FROM = 24;

function Crib() {
  const months = useBabyMonths() ?? 0;
  if (months >= TODDLER_BED_FROM) return <ToddlerBed />;
  const backSlats = [];
  for (let x = 48; x <= 212; x += 10.5) {
    backSlats.push(<SvgRect key={x} x={x} y={yBack(x) + 4} width={4} height={58} fill={wood.side} />);
  }
  const frontSlats = [];
  for (let x = 27; x <= 190; x += 10.5) {
    const top = yFront(x) + 5;
    frontSlats.push(
      <G key={x}>
        <SvgRect x={x} y={top} width={4.6} height={62} fill={wood.face} />
        <SvgRect x={x} y={top} width={1.4} height={62} fill={wood.top} opacity={0.7} />
      </G>,
    );
  }
  const sideSlats = (from: [number, number], to: [number, number]) => {
    const out = [];
    for (let t = 0.14; t < 0.95; t += 0.14) {
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;
      out.push(<SvgRect key={t} x={x - 1.6} y={y + 3} width={3.4} height={60} fill={wood.side} />);
    }
    return out;
  };

  // Mattress top sits ~40 units below the rails.
  const m = 40;
  const mattressTop: [number, number][] = [
    [BACK.x0 + 5, BACK.y0 + m],
    [BACK.x1 - 4, BACK.y1 + m],
    [FRONT.x1 - 4, FRONT.y1 + m],
    [FRONT.x0 + 5, FRONT.y0 + m],
  ];

  return (
    <G>
      <Footprint p={[[16, 436], [198, 462], [222, 372], [40, 346]]} opacity={0.42} />
      <BaseShadow from={[12, 436]} to={[202, 462]} depth={16} opacity={0.6} />
      <FootDot x={18} y={437} r={6} />
      <FootDot x={196} y={463} r={6} />
      {/* back posts */}
      <SvgRect x={BACK.x0 - 3} y={BACK.y0 - 4} width={7} height={RAIL_H - 6} fill={wood.side} />
      <SvgRect x={BACK.x1 - 3} y={BACK.y1 - 4} width={7} height={RAIL_H - 6} fill={wood.side} />
      {backSlats}
      <Rail {...BACK} />
      {/* mattress */}
      <Quad p={mattressTop} fill="url(#nur-mattress)" />
      <Quad
        p={[mattressTop[3], mattressTop[2], [mattressTop[2][0], mattressTop[2][1] + 16], [mattressTop[3][0], mattressTop[3][1] + 16]]}
        fill="#E6DCCB"
      />
      {/* folded blanket, sage, at the foot of the mattress */}
      <Quad p={[[150, 323], [205, 331], [196, 360], [140, 351]]} fill="#8E9C88" />
      <Quad p={[[140, 351], [196, 360], [196, 366], [140, 357]]} fill="#6F7D6B" />
      <Path d="M152 333 L198 340" stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} />
      <PixelBaby x={56} y={297} />
      {/* sides */}
      {sideSlats([BACK.x0, BACK.y0], [FRONT.x0, FRONT.y0])}
      {sideSlats([BACK.x1, BACK.y1], [FRONT.x1, FRONT.y1])}
      <Rail x0={BACK.x0} y0={BACK.y0} x1={FRONT.x0} y1={FRONT.y0} t={5} face={wood.side} />
      <Rail x0={BACK.x1} y0={BACK.y1} x1={FRONT.x1} y1={FRONT.y1} t={5} face={wood.side} />
      {/* front */}
      <Rail x0={FRONT.x0} y0={FRONT.y0 + 64} x1={FRONT.x1} y1={FRONT.y1 + 64} t={6} />
      {frontSlats}
      <Rail {...FRONT} t={7} />
      <SvgRect x={FRONT.x0 - 4} y={FRONT.y0 - 5} width={8} height={RAIL_H + 4} fill={wood.face} />
      <SvgRect x={FRONT.x0 - 4} y={FRONT.y0 - 5} width={2.4} height={RAIL_H + 4} fill={wood.top} opacity={0.6} />
      <SvgRect x={FRONT.x1 - 4} y={FRONT.y1 - 5} width={8} height={RAIL_H + 4} fill={wood.side} />
    </G>
  );
}

function ToddlerBed() {
  const m = 76; // mattress sits low, close to the floor
  const top: [number, number][] = [
    [BACK.x0 + 5, BACK.y0 + m],
    [BACK.x1 - 4, BACK.y1 + m],
    [FRONT.x1 - 4, FRONT.y1 + m],
    [FRONT.x0 + 5, FRONT.y0 + m],
  ];
  const floorF = (x: number) => yFront(x) + 97;
  return (
    <G>
      <Footprint p={[[16, 436], [198, 462], [222, 372], [40, 346]]} opacity={0.4} />
      <BaseShadow from={[12, 436]} to={[202, 462]} depth={14} opacity={0.6} />
      {/* headboard on the left end */}
      <Quad p={[[BACK.x0 - 2, BACK.y0 + 22], [FRONT.x0 - 2, FRONT.y0 + 34], [FRONT.x0 - 2, floorF(FRONT.x0)], [BACK.x0 - 2, BACK.y0 + 92]]} fill={wood.side} />
      <Quad p={[[BACK.x0 - 2, BACK.y0 + 22], [FRONT.x0 - 2, FRONT.y0 + 34], [FRONT.x0 + 4, FRONT.y0 + 32], [BACK.x0 + 4, BACK.y0 + 20]]} fill={wood.top} />
      {/* mattress */}
      <Quad p={top} fill="url(#nur-mattress)" />
      <Quad p={[top[3], top[2], [top[2][0], top[2][1] + 12], [top[3][0], top[3][1] + 12]]} fill="#E6DCCB" />
      {/* low frame and legs */}
      <Quad p={[[FRONT.x0, FRONT.y0 + m + 12], [FRONT.x1, FRONT.y1 + m + 12], [FRONT.x1, floorF(FRONT.x1) - 6], [FRONT.x0, floorF(FRONT.x0) - 6]]} fill={wood.face} />
      <SvgRect x={FRONT.x0 - 1} y={floorF(FRONT.x0) - 8} width={7} height={8} fill={wood.dark} />
      <SvgRect x={FRONT.x1 - 6} y={floorF(FRONT.x1) - 8} width={7} height={8} fill={wood.dark} />
      {/* blanket at the foot */}
      <Quad p={[[150, 323 + 36], [205, 331 + 36], [196, 360 + 36], [140, 351 + 36]]} fill="#8E9C88" />
      <Quad p={[[140, 351 + 36], [196, 360 + 36], [196, 366 + 36], [140, 357 + 36]]} fill="#6F7D6B" />
      <PixelBaby x={56} y={297 + 36} />
      {/* short guard rail along the front, by the pillow end */}
      <Rail x0={FRONT.x0 + 2} y0={FRONT.y0 + m - 16} x1={FRONT.x0 + 80} y1={yFront(FRONT.x0 + 80) + m - 16} t={5} />
      {[FRONT.x0 + 4, FRONT.x0 + 76].map((x) => (
        <SvgRect key={x} x={x} y={yFront(x) + m - 16} width={4} height={18} fill={wood.face} />
      ))}
    </G>
  );
}

function Nightstand() {
  return (
    <G>
      <BaseShadow from={[223, 384]} to={[282, 392]} depth={12} opacity={0.6} />
      <BaseShadow from={[281, 392]} to={[290, 357]} depth={6} opacity={0.4} />
      <Quad p={[[234, 304], [288, 312], [280, 344], [226, 336]]} fill={wood.top} />
      <Quad p={[[280, 344], [288, 312], [288, 358], [280, 392]]} fill={wood.side} />
      <Quad p={[[226, 336], [280, 344], [280, 392], [226, 384]]} fill={wood.face} />
      {/* drawer */}
      <Path d={`M226 359 L280 367`} stroke={wood.line} strokeWidth={1} />
      <Path d={`M246 349.5 L260 351.5`} stroke={wood.dark} strokeWidth={2} strokeLinecap="round" />
      {/* open shelf */}
      <Quad p={[[230, 364], [276, 371], [276, 388], [230, 381]]} fill="#4E3826" />
      <Quad p={[[230, 377], [276, 384], [276, 388], [230, 381]]} fill={wood.side} />
      {/* lamp base */}
      <Ellipse cx={255} cy={333} rx={10} ry={3} fill="rgba(30,18,8,0.35)" />
      <Path d="M248 318 Q246 326 250 332 L260 332 Q264 326 262 318 Z" fill="#D9CBB4" />
      {/* shade (unlit base colour; the glow layer brightens it) */}
      <SvgRect x={240} y={280} width={30} height={38} rx={9} fill="#E9DCC6" />
      <Ellipse cx={255} cy={281} rx={15} ry={3.4} fill="#F3E9D8" />
    </G>
  );
}

function WallDetails() {
  return (
    <G>
      {/* framed print */}
      <SvgRect x={96} y={158} width={60} height={74} rx={2} fill={wood.face} />
      <SvgRect x={100} y={162} width={52} height={66} fill="#EADFCC" />
      <Path d="M112 218 V198 A14 14 0 0 1 140 198 V218 Z" fill="#9AA796" opacity={0.85} />
      <Circle cx={126} cy={180} r={4} fill="#C6977F" opacity={0.8} />
      {/* outlet */}
      <SvgRect x={316} y={322} width={9} height={14} rx={1.5} fill="#EFE6D6" stroke="rgba(53,47,41,0.25)" strokeWidth={0.6} />
    </G>
  );
}

export const nurseryArt: RoomArt = {
  id: 'nursery',
  floor: '#1C140E',
  // Matches the top of the wall under the ceiling shade.
  wall: '#63513D',
  defs: (
    <>
      {wallGradient('nur-wall', '#7E6950', '#B49B7B')}
      {ambientDefs('nur')}
      <LinearGradient id="nur-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#3A2A1E" />
        <Stop offset="1" stopColor="#1C140E" />
      </LinearGradient>
      <LinearGradient id="nur-mattress" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F4EEE3" />
        <Stop offset="1" stopColor="#E2D7C4" />
      </LinearGradient>
      {shadowGradient('nur-shadow')}
      {glowGradient('nur-glow', '#FFD79A', 0.85)}
      {glowGradient('nur-wash', '#FFE1B0', 0.32)}
      {glowGradient('nur-pool', '#FFC983', 0.5)}
      {glowGradient('nur-core', '#FFF4DC', 1)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="nur-wall" floorId="nur-floor" baseboard="#A8916F" ambient="nur" />
          {/* the crib's soft shadow on the wall, thrown left by the lamp */}
          <ContactShadow id="nur-shadow" cx={92} cy={262} rx={128} ry={58} opacity={0.42} />
          {/* a soft wool rug, so the floor reads as a room rather than a void */}
          <Ellipse cx={200} cy={564} rx={180} ry={66} fill="#120A05" opacity={0.25} />
          <Ellipse cx={200} cy={560} rx={178} ry={64} fill="#4A382B" />
          <Ellipse cx={200} cy={560} rx={160} ry={55} fill="none" stroke="#5A4535" strokeWidth={3} />
          <WallDetails />
          <Whiteboard />
        </G>
      ),
    },
    {
      depth: 0.4,
      node: (
        <G>
          <Crib />
          <Nightstand />
        </G>
      ),
    },
    { depth: 0.3, node: <Vignette ambient="nur" /> },
  ],
  glow: (
    <G>
      <Ellipse cx={240} cy={260} rx={360} ry={300} fill="url(#nur-wash)" />
      <Ellipse cx={256} cy={296} rx={220} ry={200} fill="url(#nur-glow)" />
      <Ellipse cx={262} cy={420} rx={160} ry={64} fill="url(#nur-pool)" />
      <SvgRect x={240} y={280} width={30} height={38} rx={9} fill="#FFF1D6" />
      <Ellipse cx={255} cy={300} rx={22} ry={26} fill="url(#nur-core)" />
    </G>
  ),
};

/** A close crop of the crib for the sleep screen, so the zoom lands somewhere continuous. */
export const CRIB_VIEWBOX = `${NURSERY.crib.x - 6} ${NURSERY.crib.y - 26} ${NURSERY.crib.w + 12} ${NURSERY.crib.h - 10}`;


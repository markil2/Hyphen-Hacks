import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ContactShadow, glowGradient, Quad, shadowGradient, Shell, wallGradient, wood } from './shared';

/**
 * The nursery at night, composed after the reference render:
 * crib on the left, a nightstand with a glowing lamp, a quiet carpet.
 */

// Crib geometry (oblique): back face sits up-and-right of the front face.
const FRONT = { x0: 18, y0: 338, x1: 196, y1: 364 };
const BACK = { x0: 40, y0: 256, x1: 218, y1: 282 };
const yFront = (x: number) => FRONT.y0 + ((x - FRONT.x0) * (FRONT.y1 - FRONT.y0)) / (FRONT.x1 - FRONT.x0);
const yBack = (x: number) => BACK.y0 + ((x - BACK.x0) * (BACK.y1 - BACK.y0)) / (BACK.x1 - BACK.x0);
const RAIL_H = 98;

export const NURSERY = {
  crib: rect(8, 240, 222, 232),
  lampShade: rect(236, 276, 38, 44),
  /** Where the pull chain hangs from (design units). */
  chainAnchor: { x: 266, y: 317 },
  nightstand: rect(222, 300, 70, 96),
};

function Rail({ x0, y0, x1, y1, t = 6, top = wood.top, face = wood.face }: { x0: number; y0: number; x1: number; y1: number; t?: number; top?: string; face?: string }) {
  return (
    <G>
      <Quad p={[[x0, y0 - 2], [x1, y1 - 2], [x1 + 3, y1 - 4], [x0 + 3, y0 - 4]]} fill={top} />
      <Quad p={[[x0, y0 - 2], [x1, y1 - 2], [x1, y1 + t], [x0, y0 + t]]} fill={face} />
    </G>
  );
}

function Crib() {
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
      <ContactShadow id="nur-shadow" cx={112} cy={452} rx={128} ry={26} opacity={0.75} />
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

function Nightstand() {
  return (
    <G>
      <ContactShadow id="nur-shadow" cx={258} cy={392} rx={46} ry={11} opacity={0.7} />
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

function Toys() {
  return (
    <G>
      {/* soft bunny, muted oat */}
      <ContactShadow id="nur-shadow" cx={268} cy={512} rx={30} ry={7} opacity={0.7} />
      <Ellipse cx={268} cy={494} rx={20} ry={18} fill="#B9AE98" />
      <Circle cx={268} cy={470} r={13} fill="#C4BAA5" />
      <Ellipse cx={261} cy={449} rx={4} ry={12} fill="#C4BAA5" transform="rotate(-12 261 449)" />
      <Ellipse cx={275} cy={449} rx={4} ry={12} fill="#B9AE98" transform="rotate(10 275 449)" />
      <Ellipse cx={261} cy={449} rx={1.8} ry={8} fill="#D9B7A5" transform="rotate(-12 261 449)" />
      <Ellipse cx={280} cy={505} rx={7} ry={5} fill="#C4BAA5" />
      {/* stacking blocks, wood and sage */}
      <ContactShadow id="nur-shadow" cx={334} cy={448} rx={26} ry={6} opacity={0.6} />
      <Quad p={[[318, 430], [340, 433], [340, 447], [318, 444]]} fill={wood.face} />
      <Quad p={[[318, 430], [340, 433], [344, 429], [322, 426]]} fill={wood.top} />
      <Quad p={[[340, 433], [344, 429], [344, 443], [340, 447]]} fill={wood.side} />
      <Quad p={[[324, 414], [340, 416], [340, 428], [324, 426]]} fill="#879783" />
      <Quad p={[[324, 414], [340, 416], [343, 413], [327, 411]]} fill="#A4B19F" />
      <Quad p={[[340, 416], [343, 413], [343, 425], [340, 428]]} fill="#6C7A68" />
    </G>
  );
}

export const nurseryArt: RoomArt = {
  id: 'nursery',
  floor: '#2C2019',
  wall: '#A8916F',
  defs: (
    <>
      {wallGradient('nur-wall', '#A8916F', '#CDB898')}
      <LinearGradient id="nur-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#4A3628" />
        <Stop offset="1" stopColor="#2C2019" />
      </LinearGradient>
      <LinearGradient id="nur-mattress" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F4EEE3" />
        <Stop offset="1" stopColor="#E2D7C4" />
      </LinearGradient>
      {shadowGradient('nur-shadow')}
      {glowGradient('nur-glow', '#FFD79A', 0.85)}
      {glowGradient('nur-pool', '#FFC983', 0.5)}
      {glowGradient('nur-core', '#FFF4DC', 1)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="nur-wall" floorId="nur-floor" baseboard="#C9B595" />
          {/* a soft wool rug, so the floor reads as a room rather than a void */}
          <Ellipse cx={200} cy={560} rx={178} ry={64} fill="#5A4536" />
          <Ellipse cx={200} cy={560} rx={160} ry={55} fill="none" stroke="#6B5444" strokeWidth={3} />
          <WallDetails />
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
    { depth: 0.85, node: <Toys /> },
  ],
  glow: (
    <G>
      <Ellipse cx={256} cy={296} rx={210} ry={190} fill="url(#nur-glow)" />
      <Ellipse cx={262} cy={420} rx={160} ry={64} fill="url(#nur-pool)" />
      <SvgRect x={240} y={280} width={30} height={38} rx={9} fill="#FFF1D6" />
      <Ellipse cx={255} cy={300} rx={22} ry={26} fill="url(#nur-core)" />
    </G>
  ),
};

/** A close crop of the crib for the sleep screen, so the zoom lands somewhere continuous. */
export const CRIB_VIEWBOX = `${NURSERY.crib.x - 6} ${NURSERY.crib.y - 26} ${NURSERY.crib.w + 12} ${NURSERY.crib.h - 10}`;


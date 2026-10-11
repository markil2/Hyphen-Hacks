import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ambientDefs, BaseShadow, ContactShadow, Floorboards, glowGradient, Quad, shadowGradient, Shell, Vignette, wallGradient, wood } from './shared';

/** The play corner: a round mat with a few toys, a low bookshelf, a wooden growth board. */

export const PLAY = {
  mat: rect(70, 380, 250, 120),
  books: rect(28, 236, 140, 100),
  growth: rect(300, 100, 50, 236),
  scale: rect(214, 270, 94, 112),
};

/** A baby scale: a curved tray on a base with a little display. Drawn at floor scale; ScaleCounter places it. */
function Scale() {
  return (
    <G>
      <Ellipse cx={327} cy={390} rx={38} ry={5} fill="rgba(40,26,14,0.3)" />
      {/* base */}
      <Quad p={[[296, 362], [364, 371], [358, 384], [290, 375]]} fill="#F3EDE2" />
      <Quad p={[[290, 375], [358, 384], [358, 394], [290, 385]]} fill="#DCD3C4" />
      <Quad p={[[358, 384], [364, 371], [364, 381], [358, 394]]} fill="#C9BFAE" />
      {/* display */}
      <Quad p={[[316, 379.6], [337, 382.4], [337, 389.4], [316, 386.6]]} fill="#1B1815" />
      <Path d="M319 383.4 L323 383.9 M325 384.2 L329 384.7 M331 385 L334 385.4" stroke="#F2C98A" strokeWidth={2.2} />
      {/* curved tray */}
      <Path d="M290 352 Q296 370 327 372 Q358 374 368 360 L362 366 Q352 380 327 378 Q300 376 294 360 Z" fill="#B7C3B2" />
      <Path d="M290 352 Q327 344 368 360 Q358 374 327 372 Q296 370 290 352 Z" fill="#A4B19F" />
      <Path d="M298 354 Q327 349 360 361" stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} fill="none" />
    </G>
  );
}

/** A small sage cabinet beside the growth board, with the baby scale on top. */
function ScaleCounter() {
  const L = 214;
  const R = 292;
  const k = 0.133;
  const fy = (x: number, y0: number) => y0 + (x - L) * k;
  const D: [number, number] = [14, -34];
  return (
    <G>
      <BaseShadow from={[L - 3, fy(L, 380)]} to={[R + D[0] + 2, fy(R, 380) - 2]} depth={12} opacity={0.55} />
      {/* right side */}
      <Quad p={[[R, fy(R, 322)], [R + D[0], fy(R, 322) + D[1]], [R + D[0], fy(R, 380) + D[1]], [R, fy(R, 380)]]} fill="#6C7A68" />
      {/* front with two doors */}
      <Quad p={[[L, fy(L, 322)], [R, fy(R, 322)], [R, fy(R, 380)], [L, fy(L, 380)]]} fill="#879783" />
      <Path d={`M${(L + R) / 2} ${fy((L + R) / 2, 328)} V${fy((L + R) / 2, 374)}`} stroke="#6C7A68" strokeWidth={1.4} />
      {[L + 30, R - 33].map((x) => (
        <SvgRect key={x} x={x} y={fy(x, 344)} width={3} height={12} rx={1.5} fill={wood.top} />
      ))}
      <Quad p={[[L, fy(L, 376)], [R, fy(R, 376)], [R, fy(R, 380)], [L, fy(L, 380)]]} fill="#4E5A4B" />
      {/* wooden top */}
      <Quad p={[[L, fy(L, 322)], [R, fy(R, 322)], [R + D[0], fy(R, 322) + D[1]], [L + D[0], fy(L, 322) + D[1]]]} fill="#D8C2A2" />
      <Quad p={[[L, fy(L, 322)], [R, fy(R, 322)], [R, fy(R, 327)], [L, fy(L, 327)]]} fill={wood.face} />
      {/* the scale, sitting on the top */}
      <G transform="translate(260 306) scale(0.74) translate(-329 -380)">
        <Scale />
      </G>
    </G>
  );
}

function GrowthBoard() {
  const marks = [];
  for (let i = 0; i < 9; i++) {
    const y = 120 + i * 24;
    marks.push(<Path key={i} d={`M312 ${y + 4} L${i % 2 ? 322 : 330} ${y + 5}`} stroke="#6E5136" strokeWidth={1.4} strokeLinecap="round" />);
  }
  return (
    <G>
      <Quad p={[[306, 104], [342, 109], [342, 332], [306, 327]]} fill={wood.top} />
      <Quad p={[[342, 109], [346, 108], [346, 331], [342, 332]]} fill={wood.side} />
      {marks}
      <Circle cx={333} cy={150} r={4} fill="#B9826B" />
      <Circle cx={333} cy={222} r={4} fill="#879783" />
      <Circle cx={333} cy={282} r={4} fill="#A9B9C6" />
    </G>
  );
}

function LowShelf() {
  return (
    <G>
      <BaseShadow from={[32, 316]} to={[168, 334]} depth={12} opacity={0.55} />
      <Quad p={[[34, 244], [166, 262], [166, 334], [34, 316]]} fill={wood.face} />
      <Quad p={[[34, 244], [166, 262], [170, 256], [38, 238]]} fill={wood.top} />
      <Quad p={[[40, 254], [160, 270], [160, 290], [40, 274]]} fill="#5A4130" />
      {/* front-facing picture books */}
      <Quad p={[[46, 254], [76, 258], [76, 286], [46, 282]]} fill="#A9B9C6" />
      <Circle cx={61} cy={270} r={6} fill="#F5F0E7" />
      <Quad p={[[84, 259], [114, 263], [114, 291], [84, 287]]} fill="#E4C6A6" />
      <Path d="M90 280 Q99 268 108 282" stroke="#879783" strokeWidth={3} fill="none" />
      <Quad p={[[122, 264], [150, 268], [150, 294], [122, 290]]} fill="#879783" />
      <Quad p={[[40, 296], [160, 312], [160, 328], [40, 312]]} fill="#6E5136" />
      {/* basket of soft blocks */}
      <SvgRect x={60} y={296} width={26} height={18} rx={3} fill="#D8C6AC" />
      <SvgRect x={110} y={304} width={30} height={18} rx={3} fill="#C9A57C" />
    </G>
  );
}

function Mat() {
  return (
    <G>
      <Ellipse cx={196} cy={442} rx={128} ry={50} fill="#EADFCC" />
      <Ellipse cx={196} cy={442} rx={110} ry={41} fill="none" stroke="#A4B19F" strokeWidth={7} />
      <Ellipse cx={196} cy={442} rx={88} ry={32} fill="none" stroke="#E1D1B8" strokeWidth={4} />
    </G>
  );
}

function Toys() {
  return (
    <G>
      {/* stacking rings */}
      <ContactShadow id="ply-shadow" cx={160} cy={454} rx={22} ry={5} opacity={0.65} />
      <Ellipse cx={160} cy={450} rx={18} ry={6} fill="#B9826B" />
      <Ellipse cx={160} cy={442} rx={15} ry={5} fill="#D8C6AC" />
      <Ellipse cx={160} cy={435} rx={12} ry={4} fill="#879783" />
      <Ellipse cx={160} cy={429} rx={9} ry={3.4} fill="#A9B9C6" />
      <SvgRect x={158} y={410} width={4} height={22} rx={2} fill={wood.face} />
      <Circle cx={160} cy={409} r={4} fill={wood.top} />
      {/* soft ball */}
      <ContactShadow id="ply-shadow" cx={238} cy={456} rx={16} ry={4} opacity={0.65} />
      <Circle cx={238} cy={444} r={13} fill="#E7DDCB" />
      <Path d="M226 440 Q238 452 250 440 M238 431 Q232 444 238 457" stroke="#B9826B" strokeWidth={1.6} fill="none" />
      {/* a wooden car */}
      <SvgRect x={200} y={466} width={30} height={12} rx={4} fill={wood.face} />
      <Circle cx={206} cy={480} r={4} fill={wood.dark} />
      <Circle cx={224} cy={480} r={4} fill={wood.dark} />
    </G>
  );
}

export const playArt: RoomArt = {
  id: 'play',
  floor: '#86643F',
  // Matches the top of the wall under the ceiling shade.
  wall: '#8F7D64',
  defs: (
    <>
      {wallGradient('ply-wall', '#BAA585', '#E1D2BA')}
      {ambientDefs('ply')}
      <LinearGradient id="ply-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B08B63" />
        <Stop offset="1" stopColor="#86643F" />
      </LinearGradient>
      {shadowGradient('ply-shadow')}
      {glowGradient('ply-glow', '#FFF2DA', 0.5)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="ply-wall" floorId="ply-floor" baseboard="#DCCBB2" ambient="ply" />
          <Floorboards />
          <GrowthBoard />
          <ScaleCounter />
          {/* bunting, quiet */}
          <Path d="M60 150 Q170 184 280 166" stroke="#A57E58" strokeWidth={1} fill="none" />
          {[90, 130, 170, 210, 250].map((x, i) => (
            <Path key={x} d={`M${x} ${158 + i * 3} l8 1 l-5 13 Z`} fill={['#A9B9C6', '#879783', '#D8C6AC', '#B9826B', '#A9B9C6'][i]} />
          ))}
        </G>
      ),
    },
    { depth: 0.4, node: <LowShelf /> },
    {
      depth: 0.7,
      node: (
        <G>
          <Mat />
          <Toys />
        </G>
      ),
    },
    { depth: 0.3, node: <Vignette ambient="ply" /> },
  ],
  glow: <Ellipse cx={200} cy={240} rx={200} ry={160} fill="url(#ply-glow)" />,
};

import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ContactShadow, Floorboards, glowGradient, Quad, shadowGradient, Shell, wallGradient, wood } from './shared';

/** The play corner: a round mat with a few toys, a low bookshelf, a wooden growth board. */

export const PLAY = {
  mat: rect(70, 380, 250, 120),
  books: rect(28, 236, 140, 100),
  growth: rect(300, 100, 50, 236),
};

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
      <ContactShadow id="ply-shadow" cx={98} cy={338} rx={76} ry={9} opacity={0.6} />
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
      <ContactShadow id="ply-shadow" cx={160} cy={454} rx={22} ry={5} opacity={0.5} />
      <Ellipse cx={160} cy={450} rx={18} ry={6} fill="#B9826B" />
      <Ellipse cx={160} cy={442} rx={15} ry={5} fill="#D8C6AC" />
      <Ellipse cx={160} cy={435} rx={12} ry={4} fill="#879783" />
      <Ellipse cx={160} cy={429} rx={9} ry={3.4} fill="#A9B9C6" />
      <SvgRect x={158} y={410} width={4} height={22} rx={2} fill={wood.face} />
      <Circle cx={160} cy={409} r={4} fill={wood.top} />
      {/* soft ball */}
      <ContactShadow id="ply-shadow" cx={238} cy={456} rx={16} ry={4} opacity={0.5} />
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
  wall: '#D3C0A1',
  defs: (
    <>
      {wallGradient('ply-wall', '#D3C0A1', '#E7DAC5')}
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
          <Shell wallId="ply-wall" floorId="ply-floor" baseboard="#DCCBB2" />
          <Floorboards />
          <GrowthBoard />
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
  ],
  glow: <Ellipse cx={200} cy={240} rx={200} ry={160} fill="url(#ply-glow)" />,
};

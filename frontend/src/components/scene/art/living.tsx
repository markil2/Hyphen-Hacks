import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ContactShadow, Floorboards, glowGradient, Quad, shadowGradient, Shell, wallGradient, wood } from './shared';

/** The living room: a soft sofa, a bookshelf of saved answers, a phone on the side table. */

export const LIVING = {
  sofa: rect(14, 262, 214, 150),
  phone: rect(236, 330, 56, 44),
  bookshelf: rect(292, 92, 92, 252),
};

function Bookshelf() {
  const books = [
    ['#A9B9C6', 14, 30], ['#879783', 10, 26], ['#D8C6AC', 12, 32], ['#B9826B', 9, 24], ['#E8DCC8', 13, 29],
  ] as const;
  const row = (y: number, offset: number) => {
    let x = 302;
    return books.map(([c, w, h], i) => {
      const bx = x;
      x += w + 2;
      const k = (i + offset) % books.length;
      return <SvgRect key={`${y}-${i}`} x={bx} y={y - books[k][2] + 0.133 * bx} width={books[k][1]} height={books[k][2]} rx={1.5} fill={books[k][0]} />;
    });
  };
  return (
    <G>
      <ContactShadow id="liv-shadow" cx={340} cy={348} rx={56} ry={9} opacity={0.6} />
      <Quad p={[[294, 96], [384, 108], [384, 352], [294, 340]]} fill={wood.face} />
      <Quad p={[[300, 102], [378, 112], [378, 344], [300, 334]]} fill="#5A4130" />
      {[150, 210, 270].map((y) => (
        <Quad key={y} p={[[300, y + 0.133 * 300 - 40], [378, y + 0.133 * 378 - 40], [378, y + 0.133 * 378 - 35], [300, y + 0.133 * 300 - 35]]} fill={wood.top} />
      ))}
      {row(110 - 40 + 40, 0)}
      {row(170 - 40 + 40, 2)}
      {row(230 - 40 + 40, 4)}
      <Ellipse cx={360} cy={292} rx={9} ry={11} fill="#879783" />
      <SvgRect x={353} y={296} width={14} height={12} rx={2} fill="#B9826B" />
    </G>
  );
}

function Sofa() {
  return (
    <G>
      <ContactShadow id="liv-shadow" cx={122} cy={404} rx={120} ry={16} opacity={0.6} />
      {/* back */}
      <Quad p={[[26, 270], [222, 296], [222, 352], [26, 326]]} fill="#93A3AF" />
      <Quad p={[[26, 270], [222, 296], [224, 290], [28, 264]]} fill="#A9B9C6" />
      {/* seat cushions */}
      <Quad p={[[22, 326], [222, 352], [212, 378], [12, 352]]} fill="#A9B9C6" />
      <Path d="M118 339 L110 365" stroke="#8C9CA8" strokeWidth={1.4} />
      {/* front */}
      <Quad p={[[12, 352], [212, 378], [212, 398], [12, 372]]} fill="#8796A2" />
      {/* arms */}
      <Quad p={[[10, 300], [30, 274], [30, 330], [10, 372]]} fill="#8796A2" />
      <Quad p={[[206, 330], [228, 300], [228, 372], [212, 398]]} fill="#7D8C98" />
      {/* cushions, muted */}
      <Quad p={[[40, 296], [84, 302], [80, 334], [36, 328]]} fill="#B9826B" />
      <Quad p={[[158, 312], [198, 318], [194, 348], [154, 342]]} fill="#879783" />
      {/* knit throw */}
      <Quad p={[[100, 330], [150, 337], [140, 382], [92, 375]]} fill="#E3D6C1" />
      <Path d="M98 345 L146 352 M96 358 L144 365" stroke="#CDBBA0" strokeWidth={1.2} />
      {/* legs */}
      <SvgRect x={18} y={372} width={5} height={8} fill={wood.dark} />
      <SvgRect x={204} y={398} width={5} height={8} fill={wood.dark} />
    </G>
  );
}

function SideTable() {
  return (
    <G>
      <ContactShadow id="liv-shadow" cx={262} cy={424} rx={28} ry={6} opacity={0.6} />
      <Path d="M254 362 L246 422 M270 364 L278 424 M262 366 L262 428" stroke={wood.side} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={262} cy={360} rx={26} ry={9} fill={wood.top} />
      <Ellipse cx={262} cy={362} rx={26} ry={9} fill={wood.face} opacity={0.4} />
      {/* phone, screen softly lit */}
      <Quad p={[[250, 352], [268, 349], [276, 360], [258, 363]]} fill="#352F29" />
      <Quad p={[[252, 352.5], [267, 350], [274, 359.5], [259, 362]]} fill="#DCE3E8" />
      {/* a mug */}
      <SvgRect x={276} y={344} width={9} height={10} rx={2} fill="#F2ECE1" />
    </G>
  );
}

function Rug() {
  return <Ellipse cx={170} cy={470} rx={170} ry={58} fill="#E2D4BE" opacity={0.85} />;
}

function FloorLamp() {
  return (
    <G>
      <Path d="M246 170 L246 330" stroke="#5C4A3A" strokeWidth={2} />
      <Path d="M232 140 L260 140 L266 172 L226 172 Z" fill="#EFE3CF" />
      <Ellipse cx={246} cy={332} rx={10} ry={3} fill="#5C4A3A" />
    </G>
  );
}

export const livingArt: RoomArt = {
  id: 'living',
  floor: '#7E5D40',
  wall: '#CDB898',
  defs: (
    <>
      {wallGradient('liv-wall', '#CDB898', '#E2D3BC')}
      <LinearGradient id="liv-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#A47E5A" />
        <Stop offset="1" stopColor="#7E5D40" />
      </LinearGradient>
      {shadowGradient('liv-shadow')}
      {glowGradient('liv-glow', '#FFE2AE', 0.6)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="liv-wall" floorId="liv-floor" baseboard="#DCCBB2" />
          <Floorboards />
          <Rug />
          {/* two small framed photos */}
          <SvgRect x={70} y={150} width={46} height={58} rx={2} fill={wood.face} />
          <SvgRect x={74} y={154} width={38} height={50} fill="#DCE3E8" />
          <Circle cx={93} cy={176} r={8} fill="#A9B9C6" />
          <SvgRect x={128} y={160} width={56} height={44} rx={2} fill={wood.face} />
          <SvgRect x={132} y={164} width={48} height={36} fill="#E6DCC8" />
          <Path d="M136 196 Q156 172 176 196 Z" fill="#879783" />
        </G>
      ),
    },
    {
      depth: 0.4,
      node: (
        <G>
          <Bookshelf />
          <FloorLamp />
          <Sofa />
        </G>
      ),
    },
    { depth: 0.7, node: <SideTable /> },
  ],
  glow: (
    <G>
      <Ellipse cx={246} cy={170} rx={120} ry={110} fill="url(#liv-glow)" />
      <Ellipse cx={262} cy={356} rx={20} ry={8} fill="#EAF0F4" opacity={0.5} />
    </G>
  ),
};

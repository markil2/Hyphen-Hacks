import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ambientDefs, ContactShadow, glowGradient, Quad, shadowGradient, Shell, Vignette, wallGradient, wood } from './shared';

/** The changing area: a wooden dresser with a changing pad, a basket, folded cloths. */

export const CHANGING = {
  pad: rect(124, 222, 176, 70),
  basket: rect(30, 360, 92, 80),
  shelf: rect(150, 110, 150, 70),
};

function Dresser() {
  const drawer = (i: number) => {
    const y = 296 + i * 30;
    return (
      <G key={i}>
        <Path d={`M136 ${y} L300 ${y + 22}`} stroke={wood.line} strokeWidth={1} />
        <SvgRect x={208} y={y + 6 + 11} width={18} height={3} rx={1.5} fill={wood.dark} />
      </G>
    );
  };
  return (
    <G>
      <ContactShadow id="chg-shadow" cx={222} cy={400} rx={110} ry={14} opacity={0.75} />
      {/* top */}
      <Quad p={[[150, 236], [314, 258], [300, 294], [136, 272]]} fill={wood.top} />
      {/* front */}
      <Quad p={[[136, 272], [300, 294], [300, 394], [136, 372]]} fill={wood.face} />
      {[0, 1, 2].map(drawer)}
      {/* side */}
      <Quad p={[[300, 294], [314, 258], [314, 358], [300, 394]]} fill={wood.side} />
      {/* changing pad with a sage cover */}
      <Quad p={[[158, 232], [304, 252], [294, 284], [146, 264]]} fill="#F2ECE1" />
      <Quad p={[[164, 236], [298, 254], [290, 279], [154, 260]]} fill="#A4B19F" />
      <Path d="M168 240 L162 262 M286 256 L282 277" stroke="#879783" strokeWidth={5} strokeLinecap="round" />
      {/* a tidy stack of nappies and a tube */}
      <SvgRect x={268} y={226} width={30} height={12} rx={3} fill="#FBF8F2" stroke="rgba(53,47,41,0.15)" strokeWidth={0.6} />
      <SvgRect x={270} y={216} width={28} height={11} rx={3} fill="#FBF8F2" stroke="rgba(53,47,41,0.15)" strokeWidth={0.6} />
    </G>
  );
}

function Basket() {
  return (
    <G>
      <ContactShadow id="chg-shadow" cx={76} cy={442} rx={50} ry={9} opacity={0.75} />
      <Path d="M36 384 L118 394 L110 440 L44 432 Z" fill="#C9A57C" />
      {[0, 1, 2, 3].map((i) => (
        <Path key={i} d={`M${38 + i * 0.5} ${394 + i * 11} L${116 - i * 2} ${404 + i * 11}`} stroke="#A57E58" strokeWidth={1.4} />
      ))}
      <Ellipse cx={77} cy={388} rx={42} ry={8} fill="#B48D64" />
      {/* folded cloths peeking out */}
      <Path d="M50 384 Q60 368 76 380 Q88 366 104 386 Z" fill="#E7DDCB" />
      <Path d="M62 384 Q74 372 90 384 Z" fill="#A9B9C6" />
    </G>
  );
}

function WallShelf() {
  return (
    <G>
      <Quad p={[[152, 170], [300, 190], [296, 198], [148, 178]]} fill={wood.top} />
      <Quad p={[[148, 178], [296, 198], [296, 202], [148, 182]]} fill={wood.face} />
      {/* folded muslins */}
      <SvgRect x={162} y={156} width={36} height={8} rx={2} fill="#E9DEC9" />
      <SvgRect x={162} y={163} width={36} height={8} rx={2} fill="#A9B9C6" />
      <SvgRect x={210} y={160} width={34} height={8} rx={2} fill="#D8A783" />
      <SvgRect x={210} y={167} width={34} height={8} rx={2} fill="#E9DEC9" />
      {/* small plant */}
      <SvgRect x={262} y={172} width={16} height={14} rx={2} fill="#F2ECE1" />
      <Ellipse cx={266} cy={166} rx={6} ry={9} fill="#879783" />
      <Ellipse cx={275} cy={164} rx={5} ry={8} fill="#6F7D6B" />
      {/* round mirror */}
      <Circle cx={92} cy={170} r={34} fill={wood.face} />
      <Circle cx={92} cy={170} r={30} fill="#DCE3E8" />
      <Path d="M76 160 Q86 150 98 150" stroke="#F5F0E7" strokeWidth={3} strokeLinecap="round" fill="none" />
    </G>
  );
}

export const changingArt: RoomArt = {
  id: 'changing',
  floor: '#7A5A3E',
  // Matches the top of the wall under the ceiling shade.
  wall: '#8D7B62',
  defs: (
    <>
      {wallGradient('chg-wall', '#B8A283', '#E0D0B7')}
      {ambientDefs('chg')}
      <LinearGradient id="chg-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#A9845E" />
        <Stop offset="1" stopColor="#7A5A3E" />
      </LinearGradient>
      {shadowGradient('chg-shadow')}
      {glowGradient('chg-glow', '#FFF0D4', 0.55)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="chg-wall" floorId="chg-floor" baseboard="#DDCDB4" ambient="chg" />
          <Ellipse cx={200} cy={470} rx={190} ry={48} fill="#D9CAB1" opacity={0.55} />
          <WallShelf />
        </G>
      ),
    },
    { depth: 0.4, node: <Dresser /> },
    { depth: 0.75, node: <Basket /> },
    { depth: 0.3, node: <Vignette ambient="chg" /> },
  ],
  glow: <Ellipse cx={220} cy={220} rx={190} ry={150} fill="url(#chg-glow)" />,
};

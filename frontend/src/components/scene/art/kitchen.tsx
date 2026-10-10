import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ContactShadow, Floorboards, glowGradient, Quad, shadowGradient, Shell, wallGradient, wood } from './shared';

/** The kitchen by day: a window, a sage counter run, an open pantry shelf, a high chair. */

const SLOPE = 0.133; // wall lines follow the wall/floor seam
const wallY = (y0: number, x: number) => y0 + SLOPE * x;

export const KITCHEN = {
  bowl: rect(70, 384, 92, 52),
  highChair: rect(56, 330, 124, 200),
  bottle: rect(282, 252, 40, 58),
  pantry: rect(204, 108, 180, 126),
};

function Window() {
  return (
    <G>
      <Quad p={[[34, 76], [146, 91], [146, 222], [34, 207]]} fill={wood.top} />
      <Quad p={[[40, 82], [140, 95], [140, 216], [40, 203]]} fill="url(#kit-sky)" />
      <Path d="M90 88.5 V210 M40 142 L140 155" stroke={wood.top} strokeWidth={4} />
      <Quad p={[[30, 207], [150, 223], [150, 229], [30, 213]]} fill={wood.face} />
      {/* a small herb pot on the sill */}
      <Path d="M108 205 L124 207 L122 220 L110 218 Z" fill="#B9826B" />
      <Ellipse cx={113} cy={200} rx={6} ry={8} fill="#879783" />
      <Ellipse cx={121} cy={199} rx={5} ry={7} fill="#6F7D6B" />
    </G>
  );
}

function PantryShelf() {
  const shelf = (y0: number) => (
    <G>
      <Quad p={[[208, wallY(y0, 208)], [384, wallY(y0, 384)], [378, wallY(y0, 384) + 9], [202, wallY(y0, 208) + 9]]} fill={wood.top} />
      <Quad p={[[202, wallY(y0, 208) + 9], [378, wallY(y0, 384) + 9], [378, wallY(y0, 384) + 14], [202, wallY(y0, 208) + 14]]} fill={wood.face} />
    </G>
  );
  const jar = (x: number, y0: number, h: number, fill: string, lid = wood.face) => {
    const base = wallY(y0, x) + 4;
    return (
      <G key={`${x}-${y0}`}>
        <SvgRect x={x} y={base - h} width={20} height={h} rx={5} fill="rgba(250,246,238,0.55)" stroke="rgba(53,47,41,0.18)" strokeWidth={0.7} />
        <SvgRect x={x + 2} y={base - h * 0.62} width={16} height={h * 0.62 - 2} rx={3} fill={fill} />
        <SvgRect x={x + 1} y={base - h - 4} width={18} height={5} rx={2} fill={lid} />
      </G>
    );
  };
  return (
    <G>
      {jar(216, 150, 30, '#E7D6B6')}
      {jar(242, 150, 24, '#C99476')}
      {jar(268, 150, 34, '#EADCC3', '#879783')}
      <SvgRect x={300} y={wallY(150, 300) - 26} width={34} height={30} rx={2} fill="#CDB89B" />
      <SvgRect x={300} y={wallY(150, 300) - 18} width={34} height={8} fill="#A9B9C6" />
      {jar(342, 150, 26, '#D9C089')}
      {shelf(150)}
      {jar(222, 208, 26, '#B9826B')}
      <SvgRect x={252} y={wallY(208, 252) - 30} width={26} height={34} rx={3} fill="#F2ECE1" stroke="rgba(53,47,41,0.15)" strokeWidth={0.7} />
      <SvgRect x={256} y={wallY(208, 252) - 22} width={18} height={10} rx={1} fill="#879783" />
      {jar(288, 208, 30, '#E9DEC9', '#B9826B')}
      {jar(316, 208, 22, '#C8B07E')}
      <Circle cx={356} cy={wallY(208, 356) - 8} r={11} fill="#D8A783" />
      {shelf(208)}
    </G>
  );
}

function Counter() {
  // Back edge against the wall, front edge toward the camera.
  const B0: [number, number] = [178, 252];
  const B1: [number, number] = [400, 282];
  const F0: [number, number] = [162, 296];
  const F1: [number, number] = [384, 326];
  return (
    <G>
      <ContactShadow id="kit-shadow" cx={280} cy={404} rx={140} ry={16} opacity={0.5} />
      {/* left end panel */}
      <Quad p={[F0, B0, [178, 324], [162, 376]]} fill="#6C7A68" />
      {/* cabinet fronts */}
      <Quad p={[[162, 302], [384, 332], [384, 406], [162, 376]]} fill="#879783" />
      {[236, 310].map((x) => (
        <Path key={x} d={`M${x} ${302 + (x - 162) * 0.135} V${376 + (x - 162) * 0.135}`} stroke="#6C7A68" strokeWidth={1.4} />
      ))}
      {[214, 288, 360].map((x) => (
        <SvgRect key={x} x={x} y={316 + (x - 162) * 0.135} width={3} height={14} rx={1.5} fill={wood.top} />
      ))}
      {/* toe kick */}
      <Quad p={[[162, 376], [384, 406], [384, 412], [162, 382]]} fill="#4E5A4B" />
      {/* worktop */}
      <Quad p={[B0, B1, F1, F0]} fill="#D8C2A2" />
      <Quad p={[F0, F1, [F1[0], F1[1] + 7], [F0[0], F0[1] + 7]]} fill={wood.face} />
    </G>
  );
}

function Bottle() {
  return (
    <G>
      <Ellipse cx={302} cy={304} rx={13} ry={3.5} fill="rgba(40,26,14,0.25)" />
      <SvgRect x={291} y={268} width={22} height={36} rx={6} fill="rgba(250,246,238,0.92)" stroke="rgba(53,47,41,0.2)" strokeWidth={0.8} />
      <SvgRect x={293} y={281} width={18} height={21} rx={4} fill="#F4EBDA" />
      <Path d="M294 286 H299 M294 292 H299 M294 298 H299" stroke="rgba(53,47,41,0.3)" strokeWidth={0.8} />
      <SvgRect x={289} y={262} width={26} height={8} rx={3} fill="#A9B9C6" />
      <Path d="M296 262 Q302 248 308 262 Z" fill="#E3C9A1" />
    </G>
  );
}

function HighChair() {
  return (
    <G>
      <ContactShadow id="kit-shadow" cx={118} cy={512} rx={70} ry={13} opacity={0.6} />
      {/* back legs */}
      <Path d="M100 398 L90 494 M150 404 L160 496" stroke={wood.side} strokeWidth={6} strokeLinecap="round" />
      {/* backrest */}
      <Quad p={[[96, 336], [154, 343], [154, 404], [96, 397]]} fill={wood.face} />
      {[108, 120, 132, 144].map((x) => (
        <SvgRect key={x} x={x} y={350 + (x - 96) * 0.12} width={5} height={36} rx={2} fill={wood.side} />
      ))}
      <Quad p={[[96, 336], [154, 343], [156, 339], [98, 332]]} fill={wood.top} />
      {/* seat */}
      <Quad p={[[90, 404], [154, 411], [150, 426], [86, 419]]} fill={wood.top} />
      {/* front legs, splayed */}
      <Path d="M88 420 L66 514 M152 428 L170 516" stroke={wood.face} strokeWidth={7} strokeLinecap="round" />
      <Ellipse cx={66} cy={515} rx={6} ry={2.2} fill={wood.dark} />
      <Ellipse cx={170} cy={517} rx={6} ry={2.2} fill={wood.dark} />
      <Path d="M76 474 L162 482" stroke={wood.side} strokeWidth={4} strokeLinecap="round" />
      {/* tray */}
      <Quad p={[[72, 398], [164, 409], [158, 432], [66, 421]]} fill="#F1E8D8" />
      <Quad p={[[66, 421], [158, 432], [158, 437], [66, 426]]} fill="#D6C7AE" />
      {/* bowl and spoon */}
      <Ellipse cx={112} cy={414} rx={17} ry={7} fill="#B9826B" />
      <Ellipse cx={112} cy={412} rx={14} ry={5} fill="#F2E3C6" />
      <Path d="M127 405 L146 398" stroke="#C9A57C" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={124} cy={407} rx={4} ry={2.4} fill="#C9A57C" />
    </G>
  );
}

export const kitchenArt: RoomArt = {
  id: 'kitchen',
  floor: '#8F6A47',
  wall: '#D6C3A6',
  defs: (
    <>
      {wallGradient('kit-wall', '#D6C3A6', '#E8DAC4')}
      <LinearGradient id="kit-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B58C62" />
        <Stop offset="1" stopColor="#8F6A47" />
      </LinearGradient>
      <LinearGradient id="kit-sky" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#C7D3DC" />
        <Stop offset="1" stopColor="#E9EEF0" />
      </LinearGradient>
      {shadowGradient('kit-shadow')}
      {glowGradient('kit-sun', '#FFF6E2', 0.7)}
    </>
  ),
  layers: [
    {
      depth: 0.12,
      node: (
        <G>
          <Shell wallId="kit-wall" floorId="kit-floor" baseboard="#E2D3BB" />
          <Floorboards color="rgba(90,60,34,0.2)" />
          <Window />
          <PantryShelf />
        </G>
      ),
    },
    { depth: 0.4, node: <Counter /> },
    {
      depth: 0.5,
      node: (
        <G>
          <Bottle />
        </G>
      ),
    },
    { depth: 0.85, node: <HighChair /> },
  ],
  glow: (
    <G>
      <Ellipse cx={92} cy={150} rx={150} ry={140} fill="url(#kit-sun)" />
    </G>
  ),
};

import { Circle, Ellipse, G, LinearGradient, Path, Rect as SvgRect, Stop } from 'react-native-svg';

import { AGE_GATES, useBabyMonths } from '@/lib/age';

import { rect } from '../geometry';
import type { RoomArt } from '../RoomScene';
import { ambientDefs, BaseShadow, ContactShadow, Floorboards, FootDot, Footprint, glowGradient, Quad, shadowGradient, Shell, Vignette, wallGradient, wood } from './shared';

/** The kitchen by day: a window, a tall fridge, a sage counter run, an open pantry shelf, a high chair. */

const SLOPE = 0.133; // wall lines follow the wall/floor seam
const wallY = (y0: number, x: number) => y0 + SLOPE * x;

export const KITCHEN = {
  bowl: rect(70, 384, 92, 52),
  fridge: rect(148, 124, 76, 246),
  bag: rect(232, 246, 44, 62),
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
      {jar(242, 150, 24, '#C99476')}
      {jar(268, 150, 34, '#EADCC3', '#879783')}
      <SvgRect x={300} y={wallY(150, 300) - 26} width={34} height={30} rx={2} fill="#CDB89B" />
      <SvgRect x={300} y={wallY(150, 300) - 18} width={34} height={8} fill="#A9B9C6" />
      {jar(342, 150, 26, '#D9C089')}
      {shelf(150)}
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
  // Back edge against the wall, front edge toward the camera. Starts right of the fridge.
  const L = 216;
  const B0: [number, number] = [L + 16, 258];
  const B1: [number, number] = [400, 282];
  const F0: [number, number] = [L, 302];
  const F1: [number, number] = [384, 326];
  const k = 0.138; // front-edge slope
  const fy = (x: number, y0: number) => y0 + (x - L) * k;
  return (
    <G>
      <BaseShadow from={[L - 4, fy(L, 382)]} to={[392, fy(392, 382)]} depth={18} />
      {/* left end panel */}
      <Quad p={[F0, B0, [L + 16, 330], [L, 382]]} fill="#6C7A68" />
      {/* cabinet fronts */}
      <Quad p={[[L, fy(L, 308)], [384, fy(384, 308)], [384, fy(384, 382)], [L, fy(L, 382)]]} fill="#879783" />
      {[268, 326].map((x) => (
        <Path key={x} d={`M${x} ${fy(x, 308)} V${fy(x, 382)}`} stroke="#6C7A68" strokeWidth={1.4} />
      ))}
      {[250, 308, 364].map((x) => (
        <SvgRect key={x} x={x} y={fy(x, 322)} width={3} height={14} rx={1.5} fill={wood.top} />
      ))}
      {/* toe kick */}
      <Quad p={[[L, fy(L, 382)], [384, fy(384, 382)], [384, fy(384, 388)], [L, fy(L, 388)]]} fill="#3F4A3D" />
      {/* worktop */}
      <Quad p={[B0, B1, F1, F0]} fill="#D8C2A2" />
      <Quad p={[F0, F1, [F1[0], F1[1] + 7], [F0[0], F0[1] + 7]]} fill={wood.face} />
    </G>
  );
}

/** A tall cream fridge against the wall, drawn in the same receding perspective as the counter. */
function Fridge() {
  const D: [number, number] = [14, -38]; // depth: toward the wall
  const slope = 0.133;
  const x0 = 150;
  const W = 58;
  const H = 202;
  const y0 = 362; // front-bottom-left, on the floor
  const at = (x: number, y: number, depth = 0): [number, number] => [x + D[0] * depth, y + (x - x0) * slope + D[1] * depth];
  const FBL = at(x0, y0);
  const FBR = at(x0 + W, y0);
  const FTL = at(x0, y0 - H);
  const FTR = at(x0 + W, y0 - H);
  const split = y0 - H + 64;
  return (
    <G>
      <BaseShadow from={[FBL[0] - 2, FBL[1]]} to={[FBR[0] + D[0], FBR[1] - 2]} depth={16} opacity={0.6} />
      {/* top and right side */}
      <Quad p={[FTL, FTR, at(x0 + W, y0 - H, 1), at(x0, y0 - H, 1)]} fill="#F8F2E7" />
      <Quad p={[FTR, at(x0 + W, y0 - H, 1), at(x0 + W, y0, 1), FBR]} fill="url(#kit-fridge-side)" />
      {/* front */}
      <Quad p={[FTL, FTR, FBR, FBL]} fill="url(#kit-fridge)" />
      {/* door gap and gasket shadow */}
      <Path d={`M${at(x0, split)[0]} ${at(x0, split)[1]} L${at(x0 + W, split)[0]} ${at(x0 + W, split)[1]}`} stroke="rgba(53,40,28,0.35)" strokeWidth={1.4} />
      <Path d={`M${at(x0, split + 1.6)[0]} ${at(x0, split + 1.6)[1]} L${at(x0 + W, split + 1.6)[0]} ${at(x0 + W, split + 1.6)[1]}`} stroke="rgba(255,255,255,0.55)" strokeWidth={0.8} />
      <Path d={`M${FTL[0] + 0.6} ${FTL[1] + 2} V${FBL[1] - 2}`} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
      <Path d={`M${FTR[0] - 0.6} ${FTR[1] + 2} V${FBR[1] - 2}`} stroke="rgba(53,40,28,0.18)" strokeWidth={1} />
      {/* handles: wood, standing off the door */}
      {[
        [split - 40, 26],
        [split + 12, 52],
      ].map(([y, h]) => {
        const [hx, hy] = at(x0 + W - 10, y);
        return (
          <G key={y}>
            <SvgRect x={hx + 1.5} y={hy + 1.5} width={4} height={h} rx={2} fill="rgba(40,26,14,0.22)" />
            <SvgRect x={hx} y={hy} width={4} height={h} rx={2} fill={wood.face} />
            <SvgRect x={hx + 0.6} y={hy + 1} width={1.2} height={h - 2} rx={0.6} fill={wood.top} />
          </G>
        );
      })}
      {/* kick grille */}
      {[0, 1, 2].map((i) => {
        const [gx, gy] = at(x0 + 8, y0 - 12 + i * 3.4);
        return <Path key={i} d={`M${gx} ${gy} l${W - 16} ${(W - 16) * slope}`} stroke="rgba(53,40,28,0.28)" strokeWidth={1.2} />;
      })}
      {/* the log sheet under a magnet, and a child's drawing on the freezer door */}
      <G transform={`rotate(-3 ${x0 + 20} ${at(x0 + 20, split + 44)[1]})`}>
        <SvgRect x={x0 + 9} y={at(x0 + 9, split + 20)[1] + 1.5} width={25} height={33} rx={1.5} fill="rgba(40,26,14,0.15)" />
        <SvgRect x={x0 + 8} y={at(x0 + 8, split + 20)[1]} width={25} height={33} rx={1.5} fill="#FBF8F2" />
        {[10, 16, 22].map((dy) => (
          <Path key={dy} d={`M${x0 + 12} ${at(x0 + 12, split + 20)[1] + dy} H${x0 + 28}`} stroke="#879783" strokeWidth={1.2} />
        ))}
        <Path d={`M${x0 + 12} ${at(x0 + 12, split + 20)[1] + 5} H${x0 + 21}`} stroke="#B9826B" strokeWidth={1.6} />
      </G>
      <Circle cx={x0 + 21} cy={at(x0 + 21, split + 21)[1]} r={3.3} fill="#B9826B" />
      <Circle cx={x0 + 20.2} cy={at(x0 + 21, split + 21)[1] - 0.8} r={1.1} fill="rgba(255,255,255,0.5)" />
      <SvgRect x={x0 + 12} y={at(x0 + 12, y0 - H + 18)[1]} width={20} height={15} rx={1} fill="#E9DCC4" />
      <Path d={`M${x0 + 15} ${at(x0 + 15, y0 - H + 30)[1]} Q${x0 + 22} ${at(x0 + 22, y0 - H + 20)[1]} ${x0 + 29} ${at(x0 + 29, y0 - H + 30)[1]}`} stroke="#A9B9C6" strokeWidth={1.5} fill="none" />
      <Circle cx={x0 + 22} cy={at(x0 + 22, y0 - H + 18)[1]} r={2.5} fill="#879783" />
    </G>
  );
}

/** A kraft paper shopping bag on the counter, with a baguette and a pouch peeking out. */
function ShoppingBag() {
  return (
    <G>
      <Ellipse cx={252} cy={300} rx={18} ry={3.5} fill="rgba(40,26,14,0.28)" />
      {/* handles */}
      <Path d="M242 268 Q245 254 250 268 M254 270 Q258 256 262 270" stroke="#A57E58" strokeWidth={1.6} fill="none" />
      {/* contents */}
      <Path d="M246 268 L242 252 L247 251 L250 267 Z" fill="#E3C9A1" />
      <SvgRect x={254} y={258} width={9} height={14} rx={2.5} fill="#A4B19F" />
      <SvgRect x={256} y={255} width={5} height={4} rx={1} fill="#B9826B" />
      {/* bag body, side and folded rim */}
      <Quad p={[[236, 268], [264, 272], [262, 302], [238, 298]]} fill="#C9A57C" />
      <Quad p={[[264, 272], [270, 269], [268, 298], [262, 302]]} fill="#AE8A61" />
      <Quad p={[[236, 268], [264, 272], [264, 276], [236, 272]]} fill="#B8946C" />
      <Path d="M244 284 L256 286" stroke="rgba(90,60,34,0.35)" strokeWidth={1} />
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

/** The solids bowl appears on the tray once the baby is old enough for solid food. */
function Bowl() {
  const months = useBabyMonths();
  if (months === null || months < AGE_GATES.solids) return null;
  return (
    <G>
      <Ellipse cx={112} cy={414} rx={17} ry={7} fill="#B9826B" />
      <Ellipse cx={112} cy={412} rx={14} ry={5} fill="#F2E3C6" />
      <Path d="M127 405 L146 398" stroke="#C9A57C" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={124} cy={407} rx={4} ry={2.4} fill="#C9A57C" />
    </G>
  );
}

function HighChair() {
  return (
    <G>
      <Footprint p={[[66, 515], [170, 517], [160, 496], [90, 494]]} opacity={0.28} />
      <ContactShadow id="kit-shadow" cx={118} cy={512} rx={54} ry={7} opacity={0.45} />
      <FootDot x={66} y={515} r={5} />
      <FootDot x={170} y={517} r={5} />
      <FootDot x={90} y={494} r={4} />
      <FootDot x={160} y={496} r={4} />
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
      <Bowl />
    </G>
  );
}

export const kitchenArt: RoomArt = {
  id: 'kitchen',
  floor: '#8F6A47',
  // Matches the top of the wall under the ceiling shade.
  wall: '#928067',
  defs: (
    <>
      {wallGradient('kit-wall', '#BFA98A', '#E3D3BA')}
      {ambientDefs('kit')}
      <LinearGradient id="kit-floor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#B58C62" />
        <Stop offset="1" stopColor="#8F6A47" />
      </LinearGradient>
      <LinearGradient id="kit-fridge" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F6EFE3" />
        <Stop offset="0.6" stopColor="#ECE2D0" />
        <Stop offset="1" stopColor="#D9CCB4" />
      </LinearGradient>
      <LinearGradient id="kit-fridge-side" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#D6C8AF" />
        <Stop offset="1" stopColor="#B8A88D" />
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
          <Shell wallId="kit-wall" floorId="kit-floor" baseboard="#E2D3BB" ambient="kit" />
          <Floorboards color="rgba(90,60,34,0.2)" />
          <Window />
          <PantryShelf />
        </G>
      ),
    },
    { depth: 0.4, node: <G><Fridge /><Counter /></G> },
    {
      depth: 0.5,
      node: (
        <G>
          <ShoppingBag />
          <Bottle />
        </G>
      ),
    },
    { depth: 0.85, node: <HighChair /> },
    { depth: 0.3, node: <Vignette ambient="kit" /> },
  ],
  glow: (
    <G>
      <Ellipse cx={92} cy={150} rx={150} ry={140} fill="url(#kit-sun)" />
    </G>
  ),
};

import { Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';

/**
 * Drawing helpers shared by every room so they read as one house:
 * the same high, slightly-left camera, the same tilted wall/floor seam,
 * the same warm wood and soft contact shadows.
 */

export const wood = {
  top: '#C9A57C',
  face: '#A57E58',
  side: '#86623F',
  dark: '#6E5136',
  line: 'rgba(70,48,28,0.35)',
};

/** Wall/floor seam: y on the left edge and the right edge of the canvas. */
export const SEAM = { left: 300, right: 352 };
export const seamY = (x: number) => SEAM.left + ((SEAM.right - SEAM.left) * x) / 390;

export const pts = (...p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(' ');

/** A soft ellipse shadow where an object meets the floor. */
export function ContactShadow({ cx, cy, rx, ry, opacity = 0.45, id }: { cx: number; cy: number; rx: number; ry: number; opacity?: number; id: string }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} opacity={opacity} />;
}

export function shadowGradient(id: string) {
  return (
    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopColor="#120A05" stopOpacity="0.85" />
      <Stop offset="0.6" stopColor="#120A05" stopOpacity="0.35" />
      <Stop offset="1" stopColor="#120A05" stopOpacity="0" />
    </RadialGradient>
  );
}

export function wallGradient(id: string, top: string, bottom: string) {
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <Stop offset="0" stopColor={top} />
      <Stop offset="1" stopColor={bottom} />
    </LinearGradient>
  );
}

export function glowGradient(id: string, color: string, strength = 0.75) {
  return (
    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopColor={color} stopOpacity={strength} />
      <Stop offset="0.45" stopColor={color} stopOpacity={strength * 0.35} />
      <Stop offset="1" stopColor={color} stopOpacity="0" />
    </RadialGradient>
  );
}

/** Back wall + floor + baseboard, in one call. */
export function Shell({ wallId, floorId, baseboard = '#E7D9C3' }: { wallId: string; floorId: string; baseboard?: string }) {
  return (
    <G>
      <Path d={`M0 0H390V${SEAM.right}L0 ${SEAM.left}Z`} fill={`url(#${wallId})`} />
      <Path d={`M0 ${SEAM.left}L390 ${SEAM.right}V760H0Z`} fill={`url(#${floorId})`} />
      <Polygon points={pts([0, SEAM.left - 9], [390, SEAM.right - 9], [390, SEAM.right], [0, SEAM.left])} fill={baseboard} />
      <Line x1={0} y1={SEAM.left - 9} x2={390} y2={SEAM.right - 9} stroke="rgba(53,47,41,0.12)" strokeWidth={0.8} />
      <Line x1={0} y1={SEAM.left} x2={390} y2={SEAM.right} stroke="rgba(20,12,6,0.35)" strokeWidth={1} />
    </G>
  );
}

/** Long floorboards running away from the camera. */
export function Floorboards({ color = 'rgba(80,52,30,0.18)', count = 11 }: { color?: string; count?: number }) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const xTop = -20 + i * 40;
    const xBottom = xTop - 70 - i * 6;
    lines.push(<Line key={i} x1={xTop} y1={seamY(Math.max(0, xTop))} x2={xBottom} y2={760} stroke={color} strokeWidth={1} />);
  }
  return <G>{lines}</G>;
}

/** Quadrilateral as a polygon, in clockwise order. */
export function Quad({ p, fill, stroke, opacity }: { p: [number, number][]; fill: string; stroke?: string; opacity?: number }) {
  return <Polygon points={pts(...p)} fill={fill} stroke={stroke} strokeWidth={stroke ? 0.8 : 0} opacity={opacity} />;
}

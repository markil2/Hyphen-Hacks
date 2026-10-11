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

/**
 * Where an object meets the floor: a tight, dark occlusion core right at the
 * base (so it reads as resting, not hovering) inside a wider soft penumbra.
 */
export function ContactShadow({ cx, cy, rx, ry, opacity = 0.45, id }: { cx: number; cy: number; rx: number; ry: number; opacity?: number; id: string }) {
  return (
    <G>
      <Ellipse cx={cx + rx * 0.06} cy={cy + ry * 0.2} rx={rx * 1.1} ry={ry * 1.2} fill={`url(#${id})`} opacity={opacity * 0.6} />
      <Ellipse cx={cx} cy={cy - ry * 0.15} rx={rx * 0.8} ry={ry * 0.42} fill={`url(#${id})`} opacity={Math.min(1, opacity * 1.5)} />
    </G>
  );
}

/**
 * A grounded shadow along a straight base edge (counters, dressers, fridges):
 * darkest right at the edge, fading out across the floor toward the camera.
 */
export function BaseShadow({ from, to, depth = 14, opacity = 0.5 }: { from: [number, number]; to: [number, number]; depth?: number; opacity?: number }) {
  const band = (d: number, o: number, spread: number, key: string) => (
    <Polygon
      key={key}
      points={pts(from, to, [to[0] + spread, to[1] + d], [from[0] - spread, from[1] + d])}
      fill="#120A05"
      opacity={o}
    />
  );
  return (
    <G>
      {band(depth, opacity * 0.18, 10, 'a')}
      {band(depth * 0.6, opacity * 0.25, 6, 'b')}
      {band(depth * 0.3, opacity * 0.4, 3, 'c')}
      {band(3, opacity * 0.7, 1, 'd')}
    </G>
  );
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

/**
 * Soft ambient light shared by every room: the wall falls off toward the
 * ceiling, the corners settle into shadow, and the wall/floor seam gets a
 * little occlusion — the way light sits in the reference render.
 */
export function ambientDefs(p: string) {
  return (
    <>
      <LinearGradient id={`${p}-ceiling`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1A100A" stopOpacity="0.42" />
        <Stop offset="1" stopColor="#1A100A" stopOpacity="0" />
      </LinearGradient>
      <LinearGradient id={`${p}-aoWall`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#1A100A" stopOpacity="0" />
        <Stop offset="1" stopColor="#1A100A" stopOpacity="0.3" />
      </LinearGradient>
      <LinearGradient id={`${p}-aoFloor`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#120A05" stopOpacity="0.46" />
        <Stop offset="1" stopColor="#120A05" stopOpacity="0" />
      </LinearGradient>
      <RadialGradient id={`${p}-vignette`} cx="55%" cy="40%" r="75%">
        <Stop offset="0.55" stopColor="#120A05" stopOpacity="0" />
        <Stop offset="1" stopColor="#120A05" stopOpacity="0.52" />
      </RadialGradient>
    </>
  );
}

/** The floor under an object, between its front and back footprint edges: darker than open floor. */
export function Footprint({ p, opacity = 0.35 }: { p: [number, number][]; opacity?: number }) {
  return <Polygon points={pts(...p)} fill="#120A05" opacity={opacity} />;
}

/** Where a leg meets the floor: a small, dark, flattened contact spot. */
export function FootDot({ x, y, r = 4, opacity = 0.55 }: { x: number; y: number; r?: number; opacity?: number }) {
  return <Ellipse cx={x} cy={y} rx={r} ry={r * 0.38} fill="#120A05" opacity={opacity} />;
}

/** Back wall + floor + baseboard, in one call. Pass `ambient` (the defs prefix) for soft room lighting. */
export function Shell({ wallId, floorId, baseboard = '#E7D9C3', ambient }: { wallId: string; floorId: string; baseboard?: string; ambient?: string }) {
  return (
    <G>
      <Path d={`M0 0H390V${SEAM.right}L0 ${SEAM.left}Z`} fill={`url(#${wallId})`} />
      <Path d={`M0 ${SEAM.left}L390 ${SEAM.right}V760H0Z`} fill={`url(#${floorId})`} />
      {ambient ? (
        <G>
          <Path d="M0 0H390V220H0Z" fill={`url(#${ambient}-ceiling)`} />
          <Path d={`M0 ${SEAM.left - 46}L390 ${SEAM.right - 46}V${SEAM.right}L0 ${SEAM.left}Z`} fill={`url(#${ambient}-aoWall)`} />
          <Path d={`M0 ${SEAM.left}L390 ${SEAM.right}V${SEAM.right + 70}L0 ${SEAM.left + 70}Z`} fill={`url(#${ambient}-aoFloor)`} />
        </G>
      ) : null}
      <Polygon points={pts([0, SEAM.left - 9], [390, SEAM.right - 9], [390, SEAM.right], [0, SEAM.left])} fill={baseboard} />
      <Line x1={0} y1={SEAM.left - 9} x2={390} y2={SEAM.right - 9} stroke="rgba(53,47,41,0.16)" strokeWidth={0.8} />
      <Line x1={0} y1={SEAM.left} x2={390} y2={SEAM.right} stroke="rgba(20,12,6,0.45)" strokeWidth={1} />
    </G>
  );
}

/** Corner falloff over the whole room; draw it last in the back layer. */
export function Vignette({ ambient }: { ambient: string }) {
  return <Path d="M0 0H390V760H0Z" fill={`url(#${ambient}-vignette)`} />;
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

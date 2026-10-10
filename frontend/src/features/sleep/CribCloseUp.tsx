import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path } from 'react-native-svg';

import { CRIB_VIEWBOX, nurseryArt } from '@/components/scene/art/nursery';

/**
 * The crib, close up — the same art the nursery camera zooms into, with the
 * baby resting on the mattress. Deliberately still: the illustration never
 * pretends to know whether the baby is asleep.
 */
export function CribCloseUp({ dim, height }: { dim: boolean; height: number }) {
  const [w, setW] = useState(0);
  const [, , vw, vh] = CRIB_VIEWBOX.split(' ').map(Number);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  // Fill the width, crop vertically around the mattress.
  const scale = w / vw;
  const drawnH = vh * scale;

  return (
    <View style={[styles.wrap, { height }]} onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel="Your baby, swaddled in the crib.">
      {w ? (
        <Animated.View entering={FadeIn.duration(320)} style={{ position: 'absolute', top: (height - drawnH) / 2 }}>
          <Svg width={w} height={drawnH} viewBox={CRIB_VIEWBOX}>
            <Defs>{nurseryArt.defs}</Defs>
            {nurseryArt.layers[0].node}
            {nurseryArt.glow ? <G opacity={dim ? 0.3 : 1}>{nurseryArt.glow}</G> : null}
            {nurseryArt.layers[1].node}
            <Baby />
            {dim ? <Path d="M-50 -50H500V900H-50Z" fill="#140D08" opacity={0.34} /> : null}
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

/** A swaddled baby lying along the crib, head toward the left rail. */
function Baby() {
  return (
    <G>
      <Ellipse cx={106} cy={350} rx={40} ry={13} fill="rgba(60,40,24,0.18)" transform="rotate(8 106 350)" />
      {/* swaddle */}
      <Path
        d="M74 334 C88 324 128 328 146 340 C152 346 150 356 140 360 C120 366 92 362 78 354 C70 349 68 340 74 334 Z"
        fill="#B7C3CD"
      />
      <Path d="M86 333 C98 342 116 346 134 345" stroke="#98A8B4" strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M92 356 C108 351 124 351 140 356" stroke="#98A8B4" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* head */}
      <Circle cx={66} cy={337} r={12.5} fill="#D7AE8A" />
      <Path d="M55 331 C58 322 72 321 77 330" fill="#8C6A4E" opacity={0.55} />
      {/* closed, resting eyes and a calm mouth */}
      <Path d="M60 339 q2.6 2 5 0" stroke="#5C4130" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <Path d="M68 341 q2.6 2 5 0" stroke="#5C4130" strokeWidth={1.1} fill="none" strokeLinecap="round" />
      <Circle cx={60} cy={344} r={2.4} fill="#E3A58E" opacity={0.45} />
    </G>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#2C2019' },
});

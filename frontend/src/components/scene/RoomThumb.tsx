import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Defs, G } from 'react-native-svg';

import type { RoomArt } from './RoomScene';

/** A still, cropped view of a room — the same art as the full scene, flattened into one drawing. */
export function RoomThumb({ art, crop, height }: { art: RoomArt; crop: string; height: number }) {
  const [w, setW] = useState(0);
  const [, , vw, vh] = crop.split(' ').map(Number);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  // Cover: scale to whichever dimension needs more, centre the rest.
  const scale = Math.max(w / vw, height / vh);
  return (
    <View onLayout={onLayout} style={{ height, overflow: 'hidden', backgroundColor: art.floor }} aria-hidden>
      {w ? (
        <View style={{ position: 'absolute', left: (w - vw * scale) / 2, top: (height - vh * scale) / 2 }}>
          <Svg width={vw * scale} height={vh * scale} viewBox={crop}>
            <Defs>{art.defs}</Defs>
            {art.layers.map((l, i) => (
              <G key={i}>{l.node}</G>
            ))}
            {art.glow}
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

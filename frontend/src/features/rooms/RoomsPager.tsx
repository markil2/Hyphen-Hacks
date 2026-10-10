import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureDetector, GestureType } from 'react-native-gesture-handler';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { ROOM_ORDER, usePager } from '@/features/navigation/PagerContext';

import { ChangingRoom } from './ChangingRoom';
import { KitchenRoom } from './KitchenRoom';
import { LivingRoom } from './LivingRoom';
import { NurseryRoom } from './NurseryRoom';
import { PlayRoom } from './PlayRoom';

const COMPONENTS = { nursery: NurseryRoom, kitchen: KitchenRoom, living: LivingRoom, changing: ChangingRoom, play: PlayRoom };

/** The rooms laid side by side; swipe to walk from one to the next. */
export function RoomsPager({ horizontalPan, dragX }: { horizontalPan: GestureType; dragX: SharedValue<number> }) {
  const { width: W } = useWindowDimensions();
  const { room, progress } = usePager();
  // Rooms mount when you get near them and stay mounted, so their state survives a swipe away.
  const [mounted, setMounted] = useState(() => new Set([0, 1]));
  const near = [room - 1, room, room + 1].filter((i) => i >= 0 && i < ROOM_ORDER.length);
  if (near.some((i) => !mounted.has(i))) setMounted(new Set([...mounted, ...near]));

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -progress.room.value * W + dragX.value }],
  }));

  return (
    <GestureDetector gesture={horizontalPan}>
      <View style={styles.viewport}>
        <Animated.View style={[styles.row, { width: W * ROOM_ORDER.length }, rowStyle]}>
          {ROOM_ORDER.map((id, i) => {
            const Room = COMPONENTS[id];
            return (
              <View
                key={id}
                style={{ width: W }}
                importantForAccessibility={room === i ? 'auto' : 'no-hide-descendants'}
                accessibilityElementsHidden={room !== i}>
                {mounted.has(i) ? <Room index={i} active={room === i} /> : null}
              </View>
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' },
  row: { flex: 1, flexDirection: 'row' },
});

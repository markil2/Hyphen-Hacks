import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { useStage } from '@/components/scene/geometry';
import { haptic } from '@/lib/haptics';
import { useCalmMotion } from '@/lib/motion';
import { colors, fonts } from '@/theme';
import { T } from '@/components/ui';

const LENGTH = 30; // design units
const PULL = 16; // how far it travels before it "clicks"

/**
 * The lamp's pull chain. Drag it down, or tap it — both do the same thing.
 * Pulling records an observation (sleep started / ended); it doesn't make anyone sleep.
 */
export function LampChain({
  anchor,
  active,
  onPull,
  disabled,
}: {
  anchor: { x: number; y: number };
  active: boolean;
  onPull: () => void;
  disabled?: boolean;
}) {
  const { s } = useStage();
  const calm = useCalmMotion();
  const y = useSharedValue(0);
  const swing = useSharedValue(0);

  const fire = () => {
    haptic.soft();
    onPull();
  };

  const tug = () => {
    if (disabled) return;
    if (calm) {
      fire();
      return;
    }
    y.value = withSequence(withTiming(PULL * s, { duration: 140 }), withSpring(0, { damping: 9, stiffness: 180 }));
    swing.value = withSequence(withTiming(4, { duration: 140 }), withSpring(0, { damping: 5, stiffness: 120 }));
    fire();
  };

  // Drag and tap are exclusive, so one gesture can never record two events.
  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetY(6)
    .failOffsetX([-24, 24])
    .onUpdate((e) => {
      y.value = Math.max(0, Math.min(PULL * 1.3 * s, e.translationY * 0.8));
      swing.value = Math.max(-6, Math.min(6, e.translationX * 0.08));
    })
    .onEnd(() => {
      const pulled = y.value >= PULL * 0.7 * s;
      y.value = withSpring(0, { damping: 9, stiffness: 180 });
      swing.value = withSpring(0, { damping: 5, stiffness: 120 });
      if (pulled) scheduleOnRN(fire);
    });
  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onEnd((_e, success) => {
      if (success) scheduleOnRN(tug);
    });
  const gesture = Gesture.Exclusive(pan, tap);

  const chainStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value * 0.5 }, { rotateZ: `${swing.value}deg` }],
  }));
  const pullStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  const w = 44;
  const left = anchor.x * s - w / 2;
  const top = anchor.y * s;
  const len = LENGTH * s;

  return (
    <View style={[styles.wrap, { left, top, width: w, height: len + 70 }]} pointerEvents="box-none">
      <GestureDetector gesture={gesture}>
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel="Lamp pull chain"
          accessibilityHint={active ? 'Ends the sleep session in progress' : 'Starts a sleep session'}
          accessibilityState={{ disabled }}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={(e) => e.nativeEvent.actionName === 'activate' && tug()}
          style={[styles.hit, { height: len + 40 }]}>
          <Animated.View style={[styles.chain, { height: len }, chainStyle]} pointerEvents="none">
            <Svg width={w} height={len}>
              <Line x1={w / 2} y1={0} x2={w / 2} y2={len} stroke="#B89A6B" strokeWidth={1.6} strokeDasharray="2.2 1.6" />
            </Svg>
          </Animated.View>
          <Animated.View style={[styles.beadWrap, { top: len - 2 }, pullStyle]} pointerEvents="none">
            <Svg width={14} height={14}>
              <Circle cx={7} cy={7} r={4.6} fill="#D7B985" stroke="#8C6C3F" strokeWidth={1} />
            </Svg>
          </Animated.View>
        </View>
      </GestureDetector>
      <View pointerEvents="none" style={[styles.tag, { top: len + 26 }]}>
        <T style={styles.tagText}>{active ? 'Pull to end' : 'Pull chain'}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center' },
  hit: { width: 44, alignItems: 'center' },
  chain: { position: 'absolute', top: 0, transformOrigin: 'top center' },
  beadWrap: { position: 'absolute' },
  tag: {
    position: 'absolute',
    paddingHorizontal: 9,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(245,240,231,0.92)',
    minWidth: 84,
    alignItems: 'center',
  },
  tagText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.charcoal },
});

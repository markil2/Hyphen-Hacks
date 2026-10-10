import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { easeOut, useCalmMotion } from '@/lib/motion';
import { colors, fonts, radius } from '@/theme';

import { Rect, useStage } from './geometry';

/**
 * A tappable object in a room. The art itself is drawn in the scene layers;
 * this places an accessible hit area over it plus a small, legible name tag.
 */
export function InteractiveObject({
  area,
  label,
  hint,
  tag,
  tagAt = 'below',
  tagShift = 0,
  onPress,
  disabled,
}: {
  area: Rect;
  /** Spoken name, e.g. "Crib". */
  label: string;
  /** What happens, e.g. "Opens sleep tracking". */
  hint: string;
  /** Visible tag text; defaults to the label. Pass null to hide. */
  tag?: string | null;
  tagAt?: 'below' | 'above' | 'inside';
  /** Nudge the tag sideways (design units), e.g. away from the screen edge. */
  tagShift?: number;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { s } = useStage();
  const calm = useCalmMotion();
  const [pressed, setPressed] = useState(false);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (calm) return;
    // A slow, occasional breath on the tag dot — a hint, not a nag.
    pulse.value = withDelay(
      400 + Math.random() * 900,
      withRepeat(withSequence(withTiming(1, { duration: 1100, easing: easeOut }), withTiming(0, { duration: 1500 }), withTiming(0, { duration: 2600 })), -1),
    );
  }, [calm, pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.9 }],
    opacity: 0.55 - pulse.value * 0.45,
  }));

  const text = tag === undefined ? label : tag;
  const box = { left: area.x * s, top: area.y * s, width: area.w * s, height: area.h * s };

  return (
    <View style={[styles.abs, box]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        disabled={disabled}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          haptic.soft();
          onPress();
        }}
        style={[StyleSheet.absoluteFill, styles.hit, pressed && styles.hitPressed]}
      />
      {text ? (
        <View
          pointerEvents="none"
          style={[
            styles.tagWrap,
            { left: -40 + tagShift * s, right: -40 - tagShift * s },
            tagAt === 'below' && { top: '100%', marginTop: 6 },
            tagAt === 'above' && { bottom: '100%', marginBottom: 6 },
            tagAt === 'inside' && { top: '50%', marginTop: -14 },
          ]}>
          <View style={[styles.tag, pressed && styles.tagPressed]}>
            <View style={styles.dotWrap}>
              <Animated.View style={[styles.dotRing, dotStyle]} />
              <View style={styles.dot} />
            </View>
            <T style={[styles.tagText, pressed && { color: colors.warmWhite }]} numberOfLines={1}>
              {text}
            </T>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  hit: { borderRadius: radius.lg },
  hitPressed: { backgroundColor: 'rgba(255,240,214,0.16)', borderWidth: 1.5, borderColor: 'rgba(255,240,214,0.6)' },
  tagWrap: { position: 'absolute', left: -40, right: -40, alignItems: 'center' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    paddingRight: 10,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,240,231,0.92)',
  },
  tagPressed: { backgroundColor: colors.charcoal },
  tagText: { fontFamily: fonts.bodySemibold, fontSize: 13, lineHeight: 16, color: colors.charcoal },
  dotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.terracotta },
  dotRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: colors.terracotta },
});

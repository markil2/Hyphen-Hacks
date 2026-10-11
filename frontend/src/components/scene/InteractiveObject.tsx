import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
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
  alert = false,
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
  /** Something needs a look: the tag glows amber and its dot pulses steadily. */
  alert?: boolean;
}) {
  const { s } = useStage();
  const calm = useCalmMotion();
  const pulse = useSharedValue(0);
  // 0 → 1 while a finger rests on the object (or a pointer hovers on web).
  const hover = useSharedValue(0);
  const setHover = (on: boolean) => hover.set(withTiming(on ? 1 : 0, { duration: on ? 140 : 260, easing: easeOut }));

  useEffect(() => {
    if (calm) return;
    // A slow, occasional breath on the tag dot — a hint, not a nag. An alert breathes steadily.
    pulse.value = alert
      ? withRepeat(withSequence(withTiming(1, { duration: 800, easing: easeOut }), withTiming(0, { duration: 800 })), -1)
      : withDelay(
          400 + Math.random() * 900,
          withRepeat(withSequence(withTiming(1, { duration: 1100, easing: easeOut }), withTiming(0, { duration: 1500 }), withTiming(0, { duration: 2600 })), -1),
        );
  }, [calm, pulse, alert]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.9 }],
    opacity: 0.55 - pulse.value * 0.45,
  }));

  // A warm pool of light gathers on the object; no outline, no hitbox shape.
  const glowStyle = useAnimatedStyle(() => ({ opacity: hover.value, transform: [{ scale: 0.92 + hover.value * 0.08 }] }));
  // The tag rises a touch and settles, like something you're about to pick up.
  const tagStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hover.value * -2.5 }, { scale: 1 + hover.value * 0.06 }],
    backgroundColor: `rgba(36,27,21,${0.26 + hover.value * 0.3})`,
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
        onPressIn={() => setHover(true)}
        onPressOut={() => setHover(false)}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        onPress={() => {
          haptic.soft();
          onPress();
        }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="hover-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFE9C4" stopOpacity={0.3} />
              <Stop offset="0.55" stopColor="#FFE9C4" stopOpacity={0.12} />
              <Stop offset="1" stopColor="#FFE9C4" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="url(#hover-glow)" />
        </Svg>
      </Animated.View>
      {text ? (
        <View
          pointerEvents="none"
          style={[
            styles.tagWrap,
            { left: -40 + tagShift * s, right: -40 - tagShift * s },
            tagAt === 'below' && { top: '100%', marginTop: 6 },
            tagAt === 'above' && { bottom: '100%', marginBottom: 6 },
            tagAt === 'inside' && { top: '50%', marginTop: -11 },
          ]}>
          <Animated.View style={[styles.tag, alert && styles.tagAlert, tagStyle]}>
            <View style={styles.dotWrap}>
              <Animated.View style={[styles.dotRing, dotStyle]} />
              <View style={styles.dot} />
            </View>
            <T style={styles.tagText} numberOfLines={1}>
              {text}
            </T>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  glow: { position: 'absolute', left: '-18%', right: '-18%', top: '-18%', bottom: '-18%' },
  tagWrap: { position: 'absolute', left: -40, right: -40, alignItems: 'center' },
  // Smoked glass: legible on the light wall and the dark carpet, without shouting.
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 7,
    paddingRight: 9,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(36,27,21,0.26)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,248,236,0.32)',
  },
  tagAlert: { borderColor: 'rgba(242,201,138,0.9)', borderWidth: 1 },
  tagText: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11.5,
    lineHeight: 14,
    color: 'rgba(255,250,242,0.95)',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowRadius: 2,
  },
  dotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.lampGlow },
  dotRing: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lampGlow },
});

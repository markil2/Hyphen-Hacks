import { ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Icon, IconName } from '@/components/icons';
import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useCalmMotion } from '@/lib/motion';
import { fonts } from '@/theme';

/** The baby monitor's display palette, shared by every room's console. */
export const screen = {
  bg: '#1B1815',
  card: '#26221E',
  line: 'rgba(243,236,224,0.1)',
  ink: '#F3ECE0',
  muted: '#A99E90',
  amber: '#F2C98A',
  green: '#7BD389',
  red: '#F0B4A4',
};

/** Warm beige plastic, like a 90s monitor handset. */
export const BEZEL = '#E8DECB';
export const BEZEL_EDGE = '#CFC2AB';

/** Faint CRT scanlines over a screen. Purely decorative. */
export function Scanlines({ opacity = 0.16 }: { opacity?: number }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="scan" width={4} height={3} patternUnits="userSpaceOnUse">
            <Line x1={0} y1={0.5} x2={4} y2={0.5} stroke="#000" strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#scan)" opacity={opacity} />
      </Svg>
    </View>
  );
}

/** A dark monitor screen set into the bezel, for any content. */
export function LcdPanel({ children, title, right, style }: { children: ReactNode; title?: string; right?: ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      {title ? (
        <View style={styles.panelHead}>
          <T style={styles.label}>{title}</T>
          {right}
        </View>
      ) : null}
      {children}
      <Scanlines opacity={0.12} />
    </View>
  );
}

/** Speaker slots moulded into the plastic. */
export function Grille({ slots = 5 }: { slots?: number }) {
  return (
    <View style={styles.grille} aria-hidden>
      {Array.from({ length: slots }).map((_, i) => (
        <View key={i} style={styles.slot} />
      ))}
    </View>
  );
}

export type ConsoleKey = {
  label: string;
  icon?: IconName;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  hint?: string;
};

type Led = 'green' | 'amber' | 'off';

/**
 * One room's readout on the monitor-style console: a status line with an LED,
 * one big value, one line of detail, and up to three soft keys.
 */
export function Readout({
  led = 'off',
  pulse = false,
  label,
  value,
  detail,
  error,
  keys = [],
  keysBelow = false,
  live = false,
  aside,
  detailLines = 1,
}: {
  led?: Led;
  pulse?: boolean;
  label: string;
  value: string;
  detail?: ReactNode;
  error?: string | null;
  keys?: ConsoleKey[];
  /** Lay keys out as a row under the text (for three quick actions). */
  keysBelow?: boolean;
  /** Announce value changes to screen readers. */
  live?: boolean;
  /** A quiet note on the right instead of keys. */
  aside?: ReactNode;
  detailLines?: number;
}) {
  const text = (
    <View style={keysBelow ? undefined : { flex: 1, minWidth: 0 }} accessible accessibilityLiveRegion={live ? 'polite' : 'none'}>
      <View style={styles.status}>
        <LedDot tone={led} pulse={pulse} />
        <T style={styles.label} numberOfLines={1}>
          {label}
        </T>
      </View>
      <T style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {value}
      </T>
      {error ? (
        <T style={[styles.detail, { color: screen.red }]} numberOfLines={2} accessibilityRole="alert">
          {error}
        </T>
      ) : detail ? (
        <T style={styles.detail} numberOfLines={detailLines}>
          {detail}
        </T>
      ) : null}
    </View>
  );

  if (keysBelow) {
    return (
      <View style={{ gap: 10 }}>
        {text}
        <View style={styles.keyRow}>
          {keys.map((k) => (
            <SoftKey key={k.label} k={k} grow />
          ))}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {text}
      {aside}
      {keys.length ? (
        <View style={styles.keyCol}>
          {keys.map((k) => (
            <SoftKey key={k.label} k={k} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** A blinking alert on the console that opens more detail, e.g. the monitor during sleep. */
export function AlertKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [styles.alert, pressed && { opacity: 0.75 }]}>
      <LedDot tone="amber" pulse />
      <T style={styles.alertText} numberOfLines={2}>
        {label}
      </T>
      <Icon name="monitor" size={18} color={screen.amber} />
    </Pressable>
  );
}

/** Points at the lamp: in the nursery, the lamp chain is the only sleep switch. */
export function LampHint({ text }: { text: string }) {
  return (
    <View style={styles.hint} accessible accessibilityLabel={`${text}: the lamp chain on the nightstand starts and ends sleep`}>
      <Icon name="lamp" size={18} color={screen.amber} />
      <T style={styles.hintText} numberOfLines={2}>
        {text}
      </T>
    </View>
  );
}

function SoftKey({ k, grow }: { k: ConsoleKey; grow?: boolean }) {
  const ink = k.primary ? '#2A211A' : screen.amber;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={k.label}
      accessibilityHint={k.hint}
      accessibilityState={{ disabled: k.disabled }}
      disabled={k.disabled}
      hitSlop={4}
      onPress={() => {
        haptic.tap();
        k.onPress();
      }}
      style={({ pressed }) => [styles.key, k.primary && styles.keyPrimary, grow && { flex: 1 }, pressed && { opacity: 0.75 }, k.disabled && { opacity: 0.45 }]}>
      {k.icon ? <Icon name={k.icon} size={15} color={ink} strokeWidth={2} /> : null}
      <T style={[styles.keyText, { color: ink }]} numberOfLines={1}>
        {k.label}
      </T>
    </Pressable>
  );
}

function LedDot({ tone, pulse }: { tone: Led; pulse: boolean }) {
  const calm = useCalmMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    o.set(pulse && !calm ? withRepeat(withTiming(0.35, { duration: 1100 }), -1, true) : 1);
  }, [pulse, calm, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  const color = tone === 'green' ? screen.green : tone === 'amber' ? screen.amber : '#5E554B';
  return <Animated.View style={[styles.led, { backgroundColor: color, shadowColor: color, shadowOpacity: tone === 'off' ? 0 : 0.9 }, style]} />;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: screen.bg,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#14110E',
    padding: 14,
    gap: 10,
    overflow: 'hidden',
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  led: { width: 7, height: 7, borderRadius: 4, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  label: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  value: { fontFamily: fonts.lcd, fontSize: 28, lineHeight: 32, color: screen.amber, marginTop: 2, textShadowColor: 'rgba(242,201,138,0.55)', textShadowRadius: 8 },
  detail: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
  keyCol: { gap: 6, alignItems: 'stretch', minWidth: 112 },
  keyRow: { flexDirection: 'row', gap: 6 },
  key: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(242,201,138,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(242,201,138,0.4)',
  },
  keyPrimary: { backgroundColor: screen.amber, borderColor: screen.amber },
  alert: { alignItems: 'center', gap: 4, width: 92, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1.5, borderColor: screen.amber, backgroundColor: 'rgba(242,201,138,0.08)' },
  alertText: { fontFamily: fonts.lcd, fontSize: 11, lineHeight: 13, color: screen.amber, textAlign: 'center', textTransform: 'uppercase' },
  hint: { alignItems: 'center', gap: 3, width: 84, paddingVertical: 7, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(242,201,138,0.3)', borderStyle: 'dashed' },
  hintText: { fontFamily: fonts.lcd, fontSize: 10.5, lineHeight: 13, color: screen.muted, textAlign: 'center', textTransform: 'uppercase' },
  keyText: { fontFamily: fonts.lcd, fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' },
  grille: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  slot: { width: 3, height: 14, borderRadius: 2, backgroundColor: '#BFB19A', borderBottomWidth: 1, borderBottomColor: '#F4ECDD' },
});

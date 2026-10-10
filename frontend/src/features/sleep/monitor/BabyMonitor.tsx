import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/icons';
import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { easeOut, useCalmMotion } from '@/lib/motion';
import { formatClock, useNow } from '@/lib/time';
import { fonts, shadow } from '@/theme';

import type { useSessionFlow } from '../useSessionFlow';
import { NightVisionFeed } from './NightVisionFeed';
import { screen, SleepDashboard } from './SleepDashboard';

const BEZEL = '#EFE8DC';
const BEZEL_EDGE = '#DCD3C4';

/**
 * The baby monitor, adapted from the reference render: a warm-white device slides
 * in from the side, its camera screen showing the crib, and a second screen unfolds
 * on its hinge with the sleep dashboard.
 */
export function BabyMonitor({ flow, onClosed }: { flow: ReturnType<typeof useSessionFlow>; onClosed: () => void }) {
  const { width: W } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const calm = useCalmMotion();
  const now = useNow(30_000);

  const enter = useSharedValue(calm ? 1 : 0);
  const unfold = useSharedValue(calm ? 1 : 0);
  const tab = useSharedValue(calm ? 1 : 0);

  useEffect(() => {
    if (calm) return;
    enter.set(withSpring(1, { damping: 20, stiffness: 140 }));
    unfold.set(withDelay(260, withTiming(1, { duration: 520, easing: easeOut })));
    tab.set(withDelay(620, withSpring(1, { damping: 14, stiffness: 160 })));
  }, [calm, enter, unfold, tab]);

  const close = () => {
    haptic.tap();
    if (calm) return onClosed();
    tab.set(withTiming(0, { duration: 120 }));
    unfold.set(withTiming(0, { duration: 220 }));
    enter.set(
      withTiming(0, { duration: 320 }, (done) => {
        if (done) scheduleOnRN(onClosed);
      }),
    );
  };

  const backdrop = useAnimatedStyle(() => ({ opacity: enter.value }));
  const device = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - enter.value) * -W }, { rotateZ: `${(1 - enter.value) * -4}deg` }],
  }));
  const panel = useAnimatedStyle(() => ({
    opacity: unfold.value,
    transform: [{ perspective: 900 }, { rotateX: `${(1 - unfold.value) * -88}deg` }],
  }));
  const sessionsTab = useAnimatedStyle(() => ({
    opacity: tab.value,
    transform: [{ translateX: (1 - tab.value) * 36 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close the baby monitor" accessibilityRole="button" />
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.device, shadow.lifted, device]}>
          {/* hinge on the left edge, as on the real device */}
          <View style={styles.hinge} />

          <View style={styles.deviceHead}>
            <T style={styles.brand}>nurture · monitor</T>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close the baby monitor" hitSlop={10} style={styles.close}>
              <Icon name="close" size={18} color="#5D554B" />
            </Pressable>
          </View>

          {/* Camera screen */}
          <View style={styles.screen} accessible accessibilityRole="image" accessibilityLabel="Monitor view of the crib: your baby, swaddled, with a soft bunny. Illustration, not a live camera.">
            <NightVisionFeed />
            <View style={styles.osdTop} pointerEvents="none">
              <View>
                <View style={styles.live}>
                  <View style={styles.liveDot} />
                  <T style={styles.osd}>LIVE</T>
                </View>
                <T style={styles.osdSmall}>Nursery</T>
              </View>
              <View style={styles.osdRight}>
                <Icon name="moon" size={14} color={screen.ink} />
                <T style={styles.osd}>{formatClock(now)}</T>
                <View style={styles.battery}>
                  <View style={styles.batteryFill} />
                </View>
              </View>
            </View>
            <T style={styles.illustration} pointerEvents="none">
              Illustration · no camera connected
            </T>
          </View>

          {/* Physical keys: only the ones that do something */}
          <View style={styles.keys}>
            <View style={styles.grille} aria-hidden>
              {Array.from({ length: 21 }).map((_, i) => (
                <View key={i} style={styles.hole} />
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={flow.active ? 'Lamp: end the sleep session' : 'Lamp: start a sleep session'}
              disabled={flow.busy}
              onPress={() => {
                haptic.soft();
                flow.toggle();
              }}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
              <Icon name="lamp" size={18} color={flow.active ? '#8A7F72' : '#B07A2E'} />
            </Pressable>
            <View style={styles.knob} aria-hidden>
              <View style={[styles.led, flow.active && styles.ledOn]} />
            </View>
          </View>

          <Animated.View style={[styles.sessionsTab, sessionsTab]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sleep sessions"
              accessibilityHint="Opens past sleep sessions"
              onPress={() => {
                haptic.tap();
                router.push('/nursery/sessions');
              }}
              style={({ pressed }) => [styles.sessionsInner, pressed && { opacity: 0.85 }]}>
              <Icon name="history" size={16} color={screen.amber} />
              <T style={styles.sessionsText}>Sleep sessions</T>
              <Icon name="chevron" size={14} color={screen.amber} />
            </Pressable>
          </Animated.View>

          {/* Hinged dashboard screen */}
          <Animated.View style={[styles.panel, panel]}>
            <View style={styles.panelScreen}>
              <SleepDashboard
                sessions={flow.sleep.items}
                active={flow.active}
                busy={flow.busy}
                error={flow.error}
                onToggleLamp={flow.toggle}
                loading={flow.sleep.status !== 'ready'}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(14,9,5,0.62)' },
  device: { backgroundColor: BEZEL, borderRadius: 30, padding: 12, paddingTop: 10, borderWidth: 1, borderColor: BEZEL_EDGE },
  hinge: { position: 'absolute', left: -6, top: 70, width: 10, height: 120, borderRadius: 5, backgroundColor: BEZEL_EDGE },
  deviceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingBottom: 8 },
  brand: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1.2, color: '#9A8F80' },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: BEZEL_EDGE },
  screen: { aspectRatio: 4 / 3, borderRadius: 18, overflow: 'hidden', backgroundColor: '#111', borderWidth: 3, borderColor: '#1A1816' },
  osdTop: { position: 'absolute', top: 10, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7BD389' },
  osd: { fontFamily: fonts.bodySemibold, fontSize: 13, color: screen.ink, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 },
  osdSmall: { fontFamily: fonts.body, fontSize: 12, color: screen.ink, opacity: 0.85, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 3 },
  osdRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  battery: { width: 22, height: 11, borderRadius: 3, borderWidth: 1.4, borderColor: screen.ink, padding: 1.5 },
  batteryFill: { flex: 1, width: '80%', borderRadius: 1, backgroundColor: screen.ink },
  illustration: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: 'rgba(243,236,224,0.7)',
  },
  keys: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 6, paddingHorizontal: 6 },
  grille: { width: 78, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  hole: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CFC5B5' },
  key: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F2E9',
    borderWidth: 1,
    borderColor: BEZEL_EDGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  keyPressed: { backgroundColor: BEZEL_EDGE },
  knob: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F7F2E9', borderWidth: 1, borderColor: BEZEL_EDGE, alignItems: 'center', paddingTop: 6 },
  led: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#CFC5B5' },
  ledOn: { backgroundColor: '#7BD389' },
  sessionsTab: { position: 'absolute', right: -6, top: 252 },
  sessionsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: 'rgba(27,24,21,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(242,201,138,0.35)',
  },
  sessionsText: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: screen.amber },
  panel: { marginTop: 10, transformOrigin: 'top' },
  panelScreen: { backgroundColor: screen.bg, borderRadius: 20, padding: 10, borderWidth: 3, borderColor: '#151310' },
});

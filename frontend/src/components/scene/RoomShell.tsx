import { useFocusEffect } from 'expo-router';
import { ReactNode, RefObject, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { T } from '@/components/ui';
import { ROOM_ORDER, usePager } from '@/features/navigation/PagerContext';
import { haptic } from '@/lib/haptics';
import { colors, fonts, HIT, radius, shadow, space } from '@/theme';

import { BEZEL, BEZEL_EDGE, Grille, Scanlines, screen } from './Console';
import { RoomArt, RoomScene, SceneHandle } from './RoomScene';

const ROOM_NAMES = ['Nursery', 'Kitchen', 'Living room', 'Changing area', 'Play corner'];

/**
 * The frame every room shares: the scene fills the screen, the room's name sits
 * on the wall with a quiet handle up to Home, and a monitor-style console at the
 * bottom shows the room's readout, the room dots, and a handle down to Settings.
 */
export function RoomShell({
  index,
  sceneRef,
  art,
  light,
  focusY,
  zoom,
  title,
  subtitle,
  description,
  dark = false,
  objects,
  sheet,
  overlay,
}: {
  index: number;
  sceneRef: RefObject<SceneHandle | null>;
  art: RoomArt;
  light?: SharedValue<number>;
  focusY?: number;
  zoom?: number;
  title: string;
  subtitle?: string;
  description: string;
  dark?: boolean;
  objects: ReactNode;
  sheet: ReactNode;
  /** Drawn above everything, e.g. the baby monitor. */
  overlay?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const pager = usePager();

  // Returning from an object's screen: glide the camera back out to the room.
  useFocusEffect(
    useCallback(() => {
      sceneRef.current?.reset(true);
    }, [sceneRef]),
  );

  const ink = dark ? colors.warmWhite : colors.charcoal;
  const last = ROOM_ORDER.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: art.floor }]}>
      <RoomScene
        ref={sceneRef}
        art={art}
        light={light}
        // Rooms are composed for a short status bar; on notched phones, lower the room so the title stays on bare wall.
        focusY={(focusY ?? 0) - insets.top * 0.9}
        zoom={zoom}
        accessibilityLabel={description}>
        {objects}
      </RoomScene>

      <View style={[styles.top, { paddingTop: insets.top + space.xs }]} pointerEvents="box-none">
        <View pointerEvents="none" style={{ flex: 1 }}>
          <T variant="title" accessibilityRole="header" style={{ color: ink }}>
            {title}
          </T>
          {subtitle ? (
            <T variant="small" style={{ color: dark ? 'rgba(245,240,231,0.82)' : colors.ink2, marginTop: -2 }}>
              {subtitle}
            </T>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go up to Home"
          accessibilityHint="You can also drag the room down"
          onPress={() => {
            haptic.tap();
            pager.goTo('home');
          }}
          hitSlop={8}
          style={({ pressed }) => [styles.handle, dark && styles.handleDark, pressed && { opacity: 0.7 }]}>
          <Icon name="up" size={16} color={ink} strokeWidth={2} />
          <T style={[styles.handleText, { color: ink }]}>Home</T>
        </Pressable>
      </View>

      <View style={[styles.console, shadow.lifted, { paddingBottom: insets.bottom ? insets.bottom - 6 : space.xs }]}>
        <View style={styles.screen}>
          {sheet}
          <Scanlines />
        </View>
        <View style={styles.nav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={index > 0 ? `Previous room: ${ROOM_NAMES[index - 1]}` : 'No previous room'}
            disabled={index === 0}
            onPress={() => pager.goToRoom(index - 1)}
            style={[styles.arrow, index === 0 && styles.arrowOff]}>
            <Icon name="back" size={16} color={colors.ink2} strokeWidth={2} />
          </Pressable>
          <View style={styles.dots} accessible accessibilityLabel={`Room ${index + 1} of ${ROOM_ORDER.length}: ${title}`}>
            {ROOM_ORDER.map((id, i) => (
              <View key={id} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={index < last ? `Next room: ${ROOM_NAMES[index + 1]}` : 'No next room'}
            disabled={index === last}
            onPress={() => pager.goToRoom(index + 1)}
            style={[styles.arrow, index === last && styles.arrowOff]}>
            <Icon name="chevron" size={16} color={colors.ink2} strokeWidth={2} />
          </Pressable>
          <View style={{ marginLeft: 'auto' }}>
            <Grille />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go down to Settings"
            accessibilityHint="You can also drag the room up"
            onPress={() => {
              haptic.tap();
              pager.goTo('settings');
            }}
            hitSlop={6}
            style={({ pressed }) => [styles.settings, pressed && { opacity: 0.6 }]}>
            <T style={styles.settingsText}>Settings</T>
            <Icon name="down" size={13} color={colors.ink3} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    paddingHorizontal: space.lg - 4,
  },
  handle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(251,248,242,0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(53,47,41,0.18)',
    marginTop: 4,
  },
  handleDark: { backgroundColor: 'rgba(36,27,21,0.35)', borderColor: 'rgba(245,240,231,0.25)' },
  handleText: { fontFamily: fonts.bodySemibold, fontSize: 13 },
  console: {
    backgroundColor: BEZEL,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BEZEL_EDGE,
    borderTopColor: '#F6F0E4',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 4,
  },
  screen: {
    backgroundColor: screen.bg,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#14110E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
    // a faint phosphor glow around the glass
    shadowColor: '#F2C98A',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  arrow: { width: HIT - 10, height: 34, alignItems: 'center', justifyContent: 'center' },
  arrowOff: { opacity: 0.25 },
  dots: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lineStrong },
  dotOn: { width: 18, backgroundColor: colors.charcoal },
  settings: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 34, paddingHorizontal: 8, marginLeft: 8 },
  settingsText: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.ink3 },
});

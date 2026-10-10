import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { RoomThumb } from '@/components/scene/RoomThumb';
import { wood } from '@/components/scene/art/shared';
import { T } from '@/components/ui';
import { ROOMS, RoomInfo } from '@/features/rooms/rooms';
import { haptic } from '@/lib/haptics';
import { easeInOut, useCalmMotion } from '@/lib/motion';
import { colors, fonts, motion, radius, space } from '@/theme';

const WALL = 7;
const ROOF = 64;

/** The whole home as a cut-away house. Tap a room and the camera moves into it. */
export default function Rooms() {
  const insets = useSafeAreaInsets();
  const calm = useCalmMotion();
  const [width, setWidth] = useState(0);
  const camK = useSharedValue(1);
  const camX = useSharedValue(0);
  const camY = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const config = { duration: calm ? 0 : motion.camera, easing: easeInOut };
      camK.set(withTiming(1, config));
      camX.set(withTiming(0, config));
      camY.set(withTiming(0, config));
    }, [calm, camK, camX, camY]),
  );

  const half = (width - WALL * 3) / 2;
  const rowH = Math.round(half * 0.82);
  const houseH = ROOF + WALL + rowH * 3 + WALL * 3;

  const cells: { room: RoomInfo; x: number; y: number; w: number; h: number }[] = width
    ? [
        { room: ROOMS.nursery, x: WALL, y: ROOF + WALL, w: half, h: rowH },
        { room: ROOMS.changing, x: WALL * 2 + half, y: ROOF + WALL, w: half, h: rowH },
        { room: ROOMS.play, x: WALL, y: ROOF + WALL * 2 + rowH, w: half, h: rowH },
        { room: ROOMS.living, x: WALL * 2 + half, y: ROOF + WALL * 2 + rowH, w: half, h: rowH },
        { room: ROOMS.kitchen, x: WALL, y: ROOF + WALL * 3 + rowH * 2, w: width - WALL * 2, h: rowH },
      ]
    : [];

  const enter = (cell: (typeof cells)[number]) => {
    haptic.soft();
    const go = () => router.push(cell.room.href);
    if (calm) return go();
    const k = Math.min(width / cell.w, 2.4);
    const cx = width / 2;
    const cy = houseH / 2;
    const config = { duration: motion.camera - 60, easing: easeInOut };
    camK.set(withTiming(k, config));
    camX.set(withTiming(-k * (cell.x + cell.w / 2 - cx), config));
    camY.set(
      withTiming(-k * (cell.y + cell.h / 2 - cy), config, (done) => {
        if (done) scheduleOnRN(go);
      }),
    );
  };

  const houseStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: camX.get() }, { translateY: camY.get() }, { scale: camK.get() }],
  }));

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: space.xxl, paddingHorizontal: space.md, gap: space.lg }}>
      <View style={{ gap: space.xxs, paddingHorizontal: 4 }}>
        <T variant="hero" accessibilityRole="header">
          Your home
        </T>
        <T variant="lead">Each room holds part of your day. Tap one to step inside.</T>
      </View>

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: houseH || 600 }}>
        {width ? (
          <Animated.View style={[{ width, height: houseH }, houseStyle]}>
            <Svg width={width} height={houseH} style={StyleSheet.absoluteFill}>
              <Path d={`M0 ${ROOF + 2} L${width / 2} 6 L${width} ${ROOF + 2} Z`} fill={wood.face} />
              <Path d={`M${WALL * 2} ${ROOF} L${width / 2} ${14 + WALL} L${width - WALL * 2} ${ROOF} Z`} fill="#E6D8C2" />
              <Path d={`M0 ${ROOF} H${width} V${houseH} H0 Z`} fill={wood.face} />
            </Svg>
            <View style={[styles.attic, { top: ROOF - 34, width }]} pointerEvents="none">
              <T style={styles.atticText}>Nurture</T>
            </View>
            {cells.map((cell) => (
              <Pressable
                key={cell.room.id}
                accessibilityRole="button"
                accessibilityLabel={`${cell.room.name}: ${cell.room.purpose}`}
                accessibilityHint="Opens the room"
                onPress={() => enter(cell)}
                style={({ pressed }) => [styles.cell, { left: cell.x, top: cell.y, width: cell.w, height: cell.h }, pressed && { opacity: 0.92 }]}>
                <RoomThumb art={cell.room.art} crop={cell.room.crop} height={cell.h} />
                <View style={styles.label} pointerEvents="none">
                  <T style={styles.name}>{cell.room.name}</T>
                  <T style={styles.purpose}>{cell.room.purpose}</T>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}
      </View>

      <T variant="small" style={{ paddingHorizontal: 4 }}>
        Community and your profile live in the tabs below.
      </T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cell: { position: 'absolute', overflow: 'hidden', borderRadius: 3 },
  label: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: 'rgba(245,240,231,0.94)',
  },
  name: { fontFamily: fonts.display, fontSize: 16, lineHeight: 19, color: colors.charcoal },
  purpose: { fontFamily: fonts.bodyMedium, fontSize: 11.5, lineHeight: 14, color: colors.ink2 },
  attic: { position: 'absolute', left: 0, alignItems: 'center' },
  atticText: { fontFamily: fonts.displayItalic, fontSize: 17, color: colors.woodDark },
});

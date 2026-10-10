import { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { HomePage } from '@/features/home/HomePage';
import { PAGES, PageName, PagerApi, PagerContext, ROOM_ORDER, RoomId } from '@/features/navigation/PagerContext';
import { RoomsPager } from '@/features/rooms/RoomsPager';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { easeInOut, useCalmMotion } from '@/lib/motion';
import { colors } from '@/theme';

/**
 * The app's spatial layout: Home sits above the rooms, Settings below.
 * Rooms are the middle and the default; swipe sideways between rooms,
 * and drag down/up to reach Home/Settings. Every swipe has a button twin.
 */
export default function HomePager() {
  const { width: W, height: H } = useWindowDimensions();
  const calm = useCalmMotion();
  const [page, setPage] = useState<number>(PAGES.rooms);
  const [room, setRoom] = useState(0);
  const [locked, setLocked] = useState(false);

  const pageSV = useSharedValue<number>(PAGES.rooms);
  const roomSV = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragX = useSharedValue(0);

  const timing = useMemo(() => ({ duration: calm ? 0 : 440, easing: easeInOut }), [calm]);

  const goTo = useCallback(
    (name: PageName) => {
      const i = PAGES[name];
      pageSV.set(withTiming(i, timing));
      setPage(i);
    },
    [pageSV, timing],
  );

  const goToRoom = useCallback(
    (target: RoomId | number) => {
      const i = typeof target === 'number' ? target : ROOM_ORDER.indexOf(target);
      roomSV.set(withTiming(Math.max(0, Math.min(ROOM_ORDER.length - 1, i)), timing));
      setRoom(i);
      pageSV.set(withTiming(PAGES.rooms, timing));
      setPage(PAGES.rooms);
    },
    [roomSV, pageSV, timing],
  );

  // Android back: leave Home/Settings for the rooms rather than exiting.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === PAGES.rooms) return false;
      goTo('rooms');
      return true;
    });
    return () => sub.remove();
  }, [page, goTo]);

  const pans = useMemo(() => {
    const vertical = Gesture.Pan()
      .enabled(!locked)
      .activeOffsetY([-18, 18])
      .failOffsetX([-14, 14])
      .onUpdate((e) => {
        dragY.set(e.translationY * 0.85);
      })
      .onEnd((e) => {
        let target: number = PAGES.rooms;
        if (e.translationY > H * 0.16 || e.velocityY > 750) target = PAGES.home;
        else if (e.translationY < -H * 0.16 || e.velocityY < -750) target = PAGES.settings;
        dragY.set(withSpring(0, { damping: 22, stiffness: 180 }));
        pageSV.set(withTiming(target, timing));
        scheduleOnRN(setPage, target);
      });

    const horizontal = Gesture.Pan()
      .enabled(!locked)
      .activeOffsetX([-14, 14])
      .failOffsetY([-16, 16])
      .onUpdate((e) => {
        const atStart = roomSV.value <= 0 && e.translationX > 0;
        const atEnd = roomSV.value >= ROOM_ORDER.length - 1 && e.translationX < 0;
        dragX.set(atStart || atEnd ? e.translationX * 0.25 : e.translationX);
      })
      .onEnd((e) => {
        let target = Math.round(roomSV.value);
        if (e.translationX < -W * 0.2 || e.velocityX < -650) target += 1;
        else if (e.translationX > W * 0.2 || e.velocityX > 650) target -= 1;
        target = Math.max(0, Math.min(ROOM_ORDER.length - 1, target));
        dragX.set(withSpring(0, { damping: 22, stiffness: 180 }));
        roomSV.set(withTiming(target, timing));
        scheduleOnRN(setRoom, target);
      });

    return { vertical, horizontal };
  }, [locked, H, W, dragY, dragX, pageSV, roomSV, timing]);

  const columnStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -pageSV.value * H + dragY.value }],
  }));

  const api: PagerApi = useMemo(
    () => ({
      page,
      room,
      goTo,
      goToRoom,
      setLocked,
      pans: [pans.vertical, pans.horizontal],
      progress: { page: pageSV, room: roomSV },
    }),
    [page, room, goTo, goToRoom, pans, pageSV, roomSV],
  );

  const hidden = (i: number) => (page === i ? 'auto' : 'no-hide-descendants');

  return (
    <PagerContext.Provider value={api}>
      <View style={styles.root}>
        <Animated.View style={[{ height: H * 3 }, columnStyle]}>
          <View style={{ height: H }} importantForAccessibility={hidden(PAGES.home)} accessibilityElementsHidden={page !== PAGES.home}>
            <HomePage />
          </View>
          <GestureDetector gesture={pans.vertical}>
            <View style={{ height: H }} importantForAccessibility={hidden(PAGES.rooms)} accessibilityElementsHidden={page !== PAGES.rooms}>
              <RoomsPager horizontalPan={pans.horizontal} dragX={dragX} />
            </View>
          </GestureDetector>
          <View style={{ height: H }} importantForAccessibility={hidden(PAGES.settings)} accessibilityElementsHidden={page !== PAGES.settings}>
            <SettingsPage />
          </View>
        </Animated.View>
      </View>
    </PagerContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden', backgroundColor: colors.cream },
});

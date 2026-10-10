import { useFocusEffect } from 'expo-router';
import { ReactNode, RefObject, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack, IconButton, T } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme';

import { RoomArt, RoomScene, SceneHandle } from './RoomScene';

/**
 * The frame every room shares: the scene fills the screen, a back control and
 * the room's name sit on the wall, and a warm sheet at the bottom holds the
 * room's main controls.
 */
export function RoomShell({
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
  backTo = '/rooms',
  showBack = true,
}: {
  sceneRef: RefObject<SceneHandle | null>;
  art: RoomArt;
  light?: SharedValue<number>;
  focusY?: number;
  zoom?: number;
  title: string;
  subtitle: string;
  description: string;
  dark?: boolean;
  objects: ReactNode;
  sheet: ReactNode;
  backTo?: string;
  showBack?: boolean;
}) {
  const insets = useSafeAreaInsets();

  // Returning from an object's screen: glide the camera back out to the room.
  useFocusEffect(
    useCallback(() => {
      sceneRef.current?.reset(true);
    }, [sceneRef]),
  );

  return (
    <View style={[styles.root, { backgroundColor: art.floor }]}>
      <RoomScene ref={sceneRef} art={art} light={light} focusY={focusY} zoom={zoom} accessibilityLabel={description}>
        {objects}
      </RoomScene>

      <View style={[styles.top, { paddingTop: insets.top + space.xs }]} pointerEvents="box-none">
        {showBack ? <IconButton icon="back" label="Back" onPress={() => goBack(backTo)} /> : null}
        <View pointerEvents="none">
          <T variant="title" accessibilityRole="header" style={{ color: dark ? colors.warmWhite : colors.charcoal }}>
            {title}
          </T>
          <T variant="small" style={{ color: dark ? 'rgba(245,240,231,0.82)' : colors.ink2, marginTop: -2 }}>
            {subtitle}
          </T>
        </View>
      </View>

      <View style={[styles.sheet, shadow.lifted, { paddingBottom: showBack ? insets.bottom + space.md : space.md }]}>{sheet}</View>
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
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  sheet: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg - 4,
    paddingTop: space.lg - 4,
    gap: space.sm,
  },
});

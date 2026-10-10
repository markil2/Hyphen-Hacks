import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RoomThumb } from '@/components/scene/RoomThumb';
import { ROOMS } from '@/features/rooms/rooms';
import { T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/theme';

/** The nursery at night, as a calm doorway into the app. */
export function AuthHero({ title, subtitle }: { title: string; subtitle: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { marginTop: -insets.top }]}>
      <RoomThumb art={ROOMS.nursery.art} crop="20 120 360 330" height={250 + insets.top} />
      <View style={[styles.brand, { top: insets.top + space.md }]} pointerEvents="none">
        <T style={styles.brandText}>Nurture</T>
      </View>
      <View style={styles.copy}>
        <T variant="hero" accessibilityRole="header">
          {title}
        </T>
        <T variant="lead">{subtitle}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: -(space.lg - 4), gap: space.md },
  brand: { position: 'absolute', left: space.lg - 4 },
  brandText: { fontFamily: fonts.displayItalic, fontSize: 22, color: colors.warmWhite },
  copy: {
    gap: space.xxs,
    marginTop: -space.xl,
    paddingTop: space.lg,
    paddingHorizontal: space.lg - 4,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
});

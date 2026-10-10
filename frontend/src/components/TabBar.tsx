import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icons';
import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, radius } from '@/theme';

const icons: Record<string, IconName> = {
  index: 'home',
  rooms: 'rooms',
  support: 'support',
  community: 'community',
  profile: 'profile',
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                haptic.tap();
                navigation.navigate(route.name, route.params);
              }
            }}
            style={styles.item}>
            <View style={[styles.iconWrap, focused && styles.iconOn]}>
              <Icon name={icons[route.name] ?? 'home'} size={22} color={focused ? colors.charcoal : colors.ink2} strokeWidth={focused ? 1.9 : 1.6} />
            </View>
            <T style={[styles.label, { color: focused ? colors.charcoal : colors.ink2, fontFamily: focused ? fonts.bodySemibold : fonts.bodyMedium }]}>
              {label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.warmWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineStrong,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52 },
  iconWrap: { width: 52, height: 30, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: colors.creamSoft },
  label: { fontSize: 11.5, lineHeight: 14, letterSpacing: 0.1 },
});

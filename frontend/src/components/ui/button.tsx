import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { haptic } from '@/lib/haptics';
import { colors, fonts, HIT, radius, space } from '@/theme';

import { T } from './text';

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'sage';

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.charcoal, fg: colors.warmWhite, border: colors.charcoal },
  secondary: { bg: colors.warmWhite, fg: colors.charcoal, border: colors.lineStrong },
  quiet: { bg: 'transparent', fg: colors.charcoal, border: 'transparent' },
  danger: { bg: colors.warmWhite, fg: colors.danger, border: 'rgba(142,59,46,0.4)' },
  sage: { bg: colors.sageDeep, fg: colors.warmWhite, border: colors.sageDeep },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  size = 'md',
  style,
  accessibilityHint,
  full = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg' | 'sm';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  full?: boolean;
}) {
  const p = palette[variant];
  const inactive = disabled || loading;
  const height = size === 'lg' ? 56 : size === 'sm' ? 40 : HIT;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      hitSlop={size === 'sm' ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          backgroundColor: p.bg,
          borderColor: p.border,
          paddingHorizontal: variant === 'quiet' ? space.xs : size === 'sm' ? space.md : space.lg,
          opacity: inactive && !loading ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        full && styles.full,
        pressed && variant !== 'quiet' && { opacity: 0.88 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} color={p.fg} size={size === 'sm' ? 18 : 20} /> : null}
          <T
            variant="bodyStrong"
            numberOfLines={1}
            style={{ color: p.fg, fontFamily: fonts.bodySemibold, fontSize: size === 'sm' ? 14 : 16 }}>
            {label}
          </T>
        </View>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'paper',
  size = HIT,
  color,
  ...rest
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  tone?: 'paper' | 'clear' | 'dark';
  size?: number;
  color?: string;
} & Omit<PressableProps, 'onPress' | 'children' | 'style'>) {
  const bg = tone === 'paper' ? colors.warmWhite : tone === 'dark' ? 'rgba(36,27,21,0.55)' : 'transparent';
  const fg = color ?? (tone === 'dark' ? colors.warmWhite : colors.charcoal);
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptic.tap();
        onPress?.();
      }}
      hitSlop={6}
      style={({ pressed }) => [
        styles.icon,
        { width: size, height: size, backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
        tone === 'paper' && styles.iconBorder,
      ]}>
      <Icon name={icon} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  icon: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconBorder: { borderWidth: 1, borderColor: colors.line },
});

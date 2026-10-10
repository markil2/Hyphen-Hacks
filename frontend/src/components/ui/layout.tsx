import { router } from 'expo-router';
import { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icons';
import { haptic } from '@/lib/haptics';
import { colors, HIT, radius, space } from '@/theme';

import { IconButton } from './button';
import { T } from './text';

/** Scrollable page on cream, with an optional back header. */
export function Screen({
  title,
  subtitle,
  back = false,
  right,
  children,
  background = colors.cream,
  contentStyle,
  footer,
  scroll = true,
  sheet = false,
  ...scrollProps
}: {
  title?: string;
  subtitle?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
  children: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  scroll?: boolean;
  /** Presented as an iOS page sheet, which already sits below the status bar. */
  sheet?: boolean;
} & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const top = sheet && Platform.OS === 'ios' ? space.xs : insets.top;
  const header =
    title || back ? (
      <Header title={title} subtitle={subtitle} back={back} right={right} closeIcon={sheet} />
    ) : null;
  return (
    <View style={[styles.screen, { backgroundColor: background, paddingTop: top }]}>
      {scroll ? (
        <ScrollView
          {...scrollProps}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: space.xxl + (footer ? 0 : insets.bottom) }, contentStyle]}>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, contentStyle]}>
          {header}
          {children}
        </View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + space.sm }]}>{footer}</View> : null}
    </View>
  );
}

export function goBack(fallback: string = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}

export function Header({
  title,
  subtitle,
  back,
  right,
  closeIcon = false,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean | (() => void);
  right?: ReactNode;
  closeIcon?: boolean;
}) {
  return (
    <View style={styles.header}>
      {back ? (
        <View style={styles.headerBar}>
          <IconButton
            icon={closeIcon && typeof back !== 'function' ? 'close' : 'back'}
            label={closeIcon && typeof back !== 'function' ? 'Close' : 'Back'}
            onPress={typeof back === 'function' ? back : () => goBack()}
          />
          <View style={{ flexDirection: 'row', gap: space.xs }}>{right}</View>
        </View>
      ) : null}
      {title ? (
        <View style={{ gap: space.xxs }}>
          <T variant="hero" accessibilityRole="header">
            {title}
          </T>
          {subtitle ? <T variant="lead">{subtitle}</T> : null}
        </View>
      ) : null}
    </View>
  );
}

export function Section({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <T variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
          {title}
        </T>
        {action ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              haptic.tap();
              action.onPress();
            }}
            hitSlop={12}
            style={styles.sectionAction}>
            <T variant="smallStrong" style={styles.linkText}>
              {action.label}
            </T>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** A quiet sheet of warm paper. Used for grouped content, never nested. */
export function Panel({ children, style, tone = 'paper' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'paper' | 'white' | 'sage' | 'blue' }) {
  const bg = { paper: colors.paper, white: colors.warmWhite, sage: colors.sageWash, blue: colors.blueWash }[tone];
  return <View style={[styles.panel, { backgroundColor: bg }, style]}>{children}</View>;
}

export function ListRow({
  title,
  subtitle,
  meta,
  icon,
  iconTone = colors.creamSoft,
  onPress,
  right,
  accessibilityLabel,
  last,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconName;
  iconTone?: string;
  onPress?: () => void;
  right?: ReactNode;
  accessibilityLabel?: string;
  last?: boolean;
}) {
  const body = (
    <>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: iconTone }]}>
          <Icon name={icon} size={20} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong" numberOfLines={2}>
          {title}
        </T>
        {subtitle ? (
          <T variant="small" numberOfLines={2}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {meta ? <T variant="caption" style={{ fontVariant: ['tabular-nums'] }}>{meta}</T> : null}
      {right}
      {onPress && !right ? <Icon name="chevron" size={18} color={colors.ink3} /> : null}
    </>
  );
  const style = [styles.row, !last && styles.rowDivider];
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [title, subtitle, meta].filter(Boolean).join(', ')}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [...style, pressed && { opacity: 0.7 }]}>
      {body}
    </Pressable>
  );
}

export function Gap({ size = space.md }: { size?: number }) {
  return <View style={{ height: size }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: space.lg - 4, gap: space.lg },
  footer: {
    paddingHorizontal: space.lg - 4,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.warmWhite,
  },
  header: { gap: space.md, paddingTop: space.sm },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: HIT },
  section: { gap: space.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  sectionAction: { minHeight: 32, justifyContent: 'center' },
  linkText: { textDecorationLine: 'underline', textDecorationColor: colors.terracotta },
  panel: { borderRadius: radius.lg, padding: space.md, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 60, paddingVertical: space.sm },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.lineStrong },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

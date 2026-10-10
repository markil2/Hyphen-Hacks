import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { dataMode } from '@/services';
import type { Origin } from '@/types';
import { colors, radius, space } from '@/theme';

import { T } from './text';

/** Marks records that come from the offline demo rather than the Nurture server. */
export function DemoBadge({ origin = 'demo', label = 'Sample' }: { origin?: Origin; label?: string }) {
  if (origin !== 'demo') return null;
  return <Pill icon="info" text={label} fg={colors.blueDeep} bg={colors.blueWash} a11y={`${label}: offline demo data`} />;
}

/** A one-line, honest note about where this screen's data lives. Only shown offline. */
export function DemoNotice({ children }: { children: string }) {
  if (dataMode !== 'demo') return null;
  return <Notice tone="blue" icon="info" text={children} />;
}

/** A calm note that always shows, e.g. a disclaimer the backend asks clients to display. */
export function Notice({ text, tone = 'blue', icon = 'info' }: { text: string; tone?: 'blue' | 'sand' | 'danger'; icon?: IconName }) {
  const t = {
    blue: { fg: colors.blueDeep, bg: colors.blueWash },
    sand: { fg: colors.ink2, bg: colors.creamSoft },
    danger: { fg: colors.danger, bg: colors.dangerWash },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: t.bg }]} accessibilityRole={tone === 'danger' ? 'alert' : 'text'}>
      <Icon name={icon} size={16} color={t.fg} />
      <T variant="small" style={{ flex: 1, color: t.fg }}>
        {text}
      </T>
    </View>
  );
}

/**
 * Review / verification status from the backend, spelled out in words with an icon
 * (never colour alone). Nothing here ever upgrades a status the server didn't give.
 */
const STATUS: Record<string, { label: string; icon: IconName; fg: string; bg: string }> = {
  not_reviewed: { label: 'Not reviewed', icon: 'shieldOff', fg: colors.ink2, bg: colors.creamSoft },
  demo_not_verified: { label: 'Fictional demo profile', icon: 'info', fg: colors.blueDeep, bg: colors.blueWash },
  public_information_not_verified_by_nurture: { label: 'Public info · not verified by Nurture', icon: 'shieldOff', fg: colors.ink2, bg: colors.creamSoft },
  public_directory_not_verified_by_nurture: { label: 'Public directory · not verified by Nurture', icon: 'shieldOff', fg: colors.ink2, bg: colors.creamSoft },
  provider_claim_not_verified_by_nurture: { label: 'Provider’s own claim · not verified', icon: 'shieldOff', fg: colors.ink2, bg: colors.creamSoft },
  official_organization_information: { label: 'Official organization info', icon: 'info', fg: colors.sageDeep, bg: colors.sageWash },
};

export function statusLabel(status: string) {
  return STATUS[status]?.label ?? status.replace(/_/g, ' ');
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: statusLabel(status), icon: 'info' as IconName, fg: colors.ink2, bg: colors.creamSoft };
  return <Pill icon={s.icon} text={s.label} fg={s.fg} bg={s.bg} a11y={`Status: ${s.label}`} />;
}

export function SourceLink({ url, label }: { url?: string; label?: string }) {
  if (!url) return <T variant="small">No source link is attached.</T>;
  return (
    <Pressable accessibilityRole="link" accessibilityHint="Opens in your browser" onPress={() => Linking.openURL(url)} style={styles.link} hitSlop={6}>
      <Icon name="link" size={16} color={colors.blueDeep} />
      <T variant="smallStrong" style={styles.linkText} numberOfLines={2}>
        {label ?? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
      </T>
    </Pressable>
  );
}

function Pill({ icon, text, fg, bg, a11y }: { icon: IconName; text: string; fg: string; bg: string; a11y: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]} accessible accessibilityLabel={a11y}>
      <Icon name={icon} size={13} color={fg} strokeWidth={2} />
      <T variant="caption" style={{ color: fg }} numberOfLines={1}>
        {text}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 },
  linkText: { color: colors.blueDeep, textDecorationLine: 'underline', flexShrink: 1 },
});

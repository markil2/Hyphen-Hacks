import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { dataMode } from '@/services';
import type { Origin, Verification } from '@/types';
import { colors, radius, space } from '@/theme';

import { T } from './text';

/** Marks anything that is sample content rather than real data. */
export function DemoBadge({ origin = 'demo', label = 'Sample' }: { origin?: Origin; label?: string }) {
  if (origin !== 'demo') return null;
  return (
    <View style={styles.demo} accessible accessibilityLabel={`${label}: demo content, not real data`}>
      <Icon name="info" size={13} color={colors.blueDeep} strokeWidth={2} />
      <T variant="caption" style={{ color: colors.blueDeep }}>
        {label}
      </T>
    </View>
  );
}

/** A one-line, honest note about where this screen's data lives. */
export function DemoNotice({ children }: { children: string }) {
  if (dataMode !== 'demo') return null;
  return (
    <View style={styles.notice} accessibilityRole="text">
      <Icon name="info" size={16} color={colors.blueDeep} />
      <T variant="small" style={{ flex: 1, color: colors.blueDeep }}>
        {children}
      </T>
    </View>
  );
}

const verificationCopy = {
  verified: { label: 'Reviewed', icon: 'shield', fg: colors.sageDeep, bg: colors.sageWash },
  pending: { label: 'Review in progress', icon: 'clock', fg: colors.woodDark, bg: colors.creamSoft },
  unverified: { label: 'Not verified', icon: 'shieldOff', fg: colors.ink2, bg: colors.creamSoft },
} as const;

/** Verification is always spelled out in words, never signalled by colour alone. */
export function VerificationBadge({ verification }: { verification: Verification }) {
  const v = verificationCopy[verification.status];
  return (
    <View style={[styles.verify, { backgroundColor: v.bg }]} accessible accessibilityLabel={`Verification: ${v.label}`}>
      <Icon name={v.icon} size={14} color={v.fg} strokeWidth={2} />
      <T variant="caption" style={{ color: v.fg }}>
        {v.label}
      </T>
    </View>
  );
}

export function SourceList({ verification }: { verification: Verification }) {
  if (!verification.sources.length) {
    return (
      <T variant="small">
        No sources are attached yet. This entry stays marked “{verificationCopy[verification.status].label}” until
        verified information and links are added.
      </T>
    );
  }
  return (
    <View style={{ gap: space.xs }}>
      {verification.note ? <T variant="small">{verification.note}</T> : null}
      {verification.sources.map((s) => (
        <Pressable
          key={s.label}
          disabled={!s.url}
          accessibilityRole={s.url ? 'link' : 'text'}
          onPress={() => s.url && Linking.openURL(s.url)}>
          <T variant="smallStrong" style={s.url ? { textDecorationLine: 'underline' } : undefined}>
            {s.label}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.blueWash,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.xs,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.blueWash,
  },
  verify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});

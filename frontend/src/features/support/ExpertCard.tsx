import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { DemoBadge, T, VerificationBadge } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, space } from '@/theme';
import type { Expert, SupportTopic } from '@/types';

export const topicLabel: Record<SupportTopic, string> = {
  sleep: 'Sleep',
  feeding: 'Feeding',
  soothing: 'Soothing',
  development: 'Development',
  recovery: 'Parent wellbeing',
  other: 'Something else',
};

const toneBg = { sage: colors.sageWash, blue: colors.blueWash, terracotta: colors.terracottaWash, wood: colors.creamSoft };
const toneFg = { sage: colors.sageDeep, blue: colors.blueDeep, terracotta: colors.terracottaDeep, wood: colors.woodDark };

export function ExpertInitials({ expert, size = 52 }: { expert: Expert; size?: number }) {
  return (
    <View style={[styles.initials, { width: size, height: size, borderRadius: size / 2, backgroundColor: toneBg[expert.tone] }]} aria-hidden>
      <T style={{ fontFamily: fonts.display, fontSize: size * 0.36, color: toneFg[expert.tone] }}>{expert.initials}</T>
    </View>
  );
}

export function ExpertCard({ expert, onPress, compact = false }: { expert: Expert; onPress: () => void; compact?: boolean }) {
  const available = expert.availability.length > 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expert.name}, ${expert.role}. Sample profile, fictional. ${available ? 'Has sample times' : 'Not taking requests'}`}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && { opacity: 0.8 }]}>
      <ExpertInitials expert={expert} size={compact ? 44 : 52} />
      <View style={{ flex: 1, gap: 3 }}>
        <T variant="bodyStrong">{expert.name}</T>
        <T variant="small">{expert.role}</T>
        {!compact ? (
          <T variant="small" numberOfLines={2} style={{ color: colors.ink3 }}>
            {expert.specialty}
          </T>
        ) : null}
        <View style={styles.badges}>
          <DemoBadge origin={expert.origin} label="Sample profile" />
          {!compact ? <VerificationBadge verification={expert.verification} /> : null}
        </View>
      </View>
      <Icon name="chevron" size={18} color={colors.ink3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  initials: { alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lineStrong,
  },
  compact: { borderBottomWidth: 0, paddingVertical: space.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
});

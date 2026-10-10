import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { StatusBadge, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, space } from '@/theme';
import type { Expert, QuestionCategory } from '@/types';

export const categoryLabel: Record<QuestionCategory, string> = {
  feeding: 'Feeding',
  sleep: 'Sleep',
  development: 'Development',
  health: 'Health',
  general: 'Something else',
};

const SERVICE_LABELS: Record<string, string> = {
  lactation: 'Lactation',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  newborn_care: 'Newborn care',
  perinatal_mental_health: 'Parent mental health',
  postpartum_doula: 'Postpartum doula',
  pediatric_therapy: 'Pediatric therapy',
  occupational_therapy: 'Occupational therapy',
  early_intervention: 'Early intervention',
  pediatrics: 'Pediatrics',
  parent_support: 'Parent support',
};

export const serviceLabel = (s: string) => SERVICE_LABELS[s] ?? s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

const tones = [
  { bg: colors.sageWash, fg: colors.sageDeep },
  { bg: colors.blueWash, fg: colors.blueDeep },
  { bg: colors.terracottaWash, fg: colors.terracottaDeep },
  { bg: colors.creamSoft, fg: colors.woodDark },
];

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export function ExpertInitials({ expert, size = 52 }: { expert: Expert; size?: number }) {
  const tone = tones[[...expert.name].reduce((n, c) => n + c.charCodeAt(0), 0) % tones.length];
  return (
    <View style={[styles.initials, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg }]} aria-hidden>
      <T style={{ fontFamily: fonts.display, fontSize: size * 0.34, color: tone.fg, paddingHorizontal: 3 }} numberOfLines={1}>{initialsOf(expert.name)}</T>
    </View>
  );
}

export function ExpertCard({ expert, onPress, compact = false }: { expert: Expert; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expert.name}, ${expert.specialty}${expert.isDemo ? '. Fictional demo profile' : '. External listing, not verified by Nurture'}`}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && { opacity: 0.8 }]}>
      <ExpertInitials expert={expert} size={compact ? 44 : 52} />
      <View style={{ flex: 1, gap: 3 }}>
        <T variant="bodyStrong">{expert.name}</T>
        <T variant="small">{expert.specialty}</T>
        {!compact && expert.organization && expert.organization !== expert.name ? (
          <T variant="small" numberOfLines={1} style={{ color: colors.ink3 }}>
            {expert.organization}
          </T>
        ) : null}
        <View style={styles.badges}>
          <StatusBadge status={expert.isDemo ? 'demo_not_verified' : expert.verificationStatus} />
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

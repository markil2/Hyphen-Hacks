import { View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { T } from '@/components/ui';
import { colors, radius, space } from '@/theme';
import type { ConsultationStatus } from '@/types';

export const statusCopy: Record<ConsultationStatus, { label: string; body: string; icon: IconName; fg: string; bg: string }> = {
  pending: {
    label: 'Pending (demo)',
    body: 'Recorded on this device. In the real app you’d see this change once the expert responds.',
    icon: 'clock',
    fg: colors.woodDark,
    bg: colors.creamSoft,
  },
  confirmed: {
    label: 'Confirmed (demo)',
    body: 'Marked as confirmed using the demo controls. No real appointment exists.',
    icon: 'check',
    fg: colors.sageDeep,
    bg: colors.sageWash,
  },
  unavailable: {
    label: 'Unavailable (demo)',
    body: 'This time isn’t available. You could pick another time or another expert.',
    icon: 'info',
    fg: colors.blueDeep,
    bg: colors.blueWash,
  },
  cancelled: { label: 'Cancelled', body: 'You cancelled this request.', icon: 'close', fg: colors.ink2, bg: colors.creamSoft },
};

/** Status is always written out, with an icon — never colour alone. */
export function ConsultStatusBadge({ status }: { status: ConsultationStatus }) {
  const s = statusCopy[status];
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: s.bg }}
      accessible
      accessibilityLabel={`Status: ${s.label}`}>
      <Icon name={s.icon} size={14} color={s.fg} strokeWidth={2} />
      <T variant="caption" style={{ color: s.fg }}>
        {s.label}
      </T>
    </View>
  );
}

export function ConsultStatusPanel({ status }: { status: ConsultationStatus }) {
  const s = statusCopy[status];
  return (
    <View style={{ flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.lg, backgroundColor: s.bg }} accessibilityLiveRegion="polite">
      <Icon name={s.icon} color={s.fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="bodyStrong" style={{ color: s.fg }}>
          {s.label}
        </T>
        <T variant="small" style={{ color: colors.charcoal }}>
          {s.body}
        </T>
      </View>
    </View>
  );
}

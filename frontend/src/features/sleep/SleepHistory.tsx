import { View } from 'react-native';

import { ListRow, T } from '@/components/ui';
import { dayLabel, formatClock, formatDuration } from '@/lib/time';
import { colors, space } from '@/theme';
import type { SleepSession } from '@/types';

import { durationOf } from './useSleep';

/** Completed sessions grouped by day. Plain facts, no judgments about duration. */
export function SleepHistory({ sessions, onEdit, limitDays }: { sessions: SleepSession[]; onEdit: (s: SleepSession) => void; limitDays?: number }) {
  const groups = new Map<string, SleepSession[]>();
  for (const s of sessions) {
    const key = dayLabel(s.endedAt ?? s.startedAt);
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  const entries = [...groups.entries()].slice(0, limitDays);
  return (
    <View style={{ gap: space.md }}>
      {entries.map(([day, list]) => (
        <View key={day}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T variant="smallStrong">{day}</T>
            <T variant="caption">{formatDuration(list.reduce((sum, s) => sum + durationOf(s), 0))} logged</T>
          </View>
          {list.map((s, i) => (
            <ListRow
              key={s.id}
              icon="moon"
              iconTone={colors.blueWash}
              title={`${formatClock(s.startedAt)} – ${s.endedAt ? formatClock(s.endedAt) : 'now'}`}
              subtitle={s.notes}
              meta={formatDuration(durationOf(s))}
              onPress={() => onEdit(s)}
              accessibilityLabel={`Sleep from ${formatClock(s.startedAt)} to ${s.endedAt ? formatClock(s.endedAt) : 'now'}, ${formatDuration(durationOf(s))}. Edit`}
              last={i === list.length - 1}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

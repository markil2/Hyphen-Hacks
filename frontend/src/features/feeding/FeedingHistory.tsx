import { router } from 'expo-router';
import { View } from 'react-native';

import { ListRow, T } from '@/components/ui';
import { dayLabel, formatClock } from '@/lib/time';
import { colors, space } from '@/theme';
import type { FeedingEntry } from '@/types';

import { feedingDetail, feedingIcon, feedingTitle } from './model';

export function editFeeding(f: FeedingEntry) {
  router.push({ pathname: f.kind === 'solid' ? '/kitchen/bowl' : '/kitchen/bottle', params: { id: f.id } });
}

/** Entries grouped by day; tap any entry to correct or remove it. */
export function FeedingHistory({ entries, limit, showDay = true }: { entries: FeedingEntry[]; limit?: number; showDay?: boolean }) {
  const shown = limit ? entries.slice(0, limit) : entries;
  const groups = new Map<string, FeedingEntry[]>();
  for (const f of shown) groups.set(dayLabel(f.at), [...(groups.get(dayLabel(f.at)) ?? []), f]);
  return (
    <View style={{ gap: space.md }}>
      {[...groups.entries()].map(([day, list]) => (
        <View key={day}>
          {showDay ? <T variant="smallStrong">{day}</T> : null}
          {list.map((f, i) => (
            <ListRow
              key={f.id}
              icon={feedingIcon(f)}
              iconTone={f.kind === 'solid' ? colors.terracottaWash : colors.sageWash}
              title={feedingTitle(f)}
              subtitle={[feedingDetail(f), f.notes].filter(Boolean).join(' — ')}
              meta={formatClock(f.at)}
              onPress={() => editFeeding(f)}
              accessibilityLabel={`${feedingTitle(f)}, ${feedingDetail(f)}, at ${formatClock(f.at)}. Edit`}
              last={i === list.length - 1}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

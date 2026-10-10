import { router } from 'expo-router';
import { View } from 'react-native';

import { AsyncBlock, Button, EmptyState, ListRow, Screen, T } from '@/components/ui';
import { diaperLabel, useDiapers } from '@/features/diapers/model';
import { dayLabel, formatClock } from '@/lib/time';
import { colors, space } from '@/theme';
import type { DiaperEntry } from '@/types';

export default function DiaperHistory() {
  const diapers = useDiapers();
  const groups = new Map<string, DiaperEntry[]>();
  for (const d of diapers.items) groups.set(dayLabel(d.at), [...(groups.get(dayLabel(d.at)) ?? []), d]);

  return (
    <Screen back title="Changes" subtitle="A simple daily record. Tap any entry to correct it.">
      <Button label="Log a change" icon="plus" onPress={() => router.push('/changing/edit')} />
      <AsyncBlock
        status={diapers.status}
        error={diapers.error}
        onRetry={diapers.retry}
        isEmpty={diapers.items.length === 0}
        empty={<EmptyState icon="diaper" title="Nothing logged yet" body="Logging is optional — use it only if it helps you." />}>
        {[...groups.entries()].map(([day, list]) => (
          <View key={day} style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm }}>
              <T variant="smallStrong">{day}</T>
              <T variant="caption">
                {list.length} change{list.length === 1 ? '' : 's'}
              </T>
            </View>
            {list.map((d, i) => (
              <ListRow
                key={d.id}
                icon="diaper"
                iconTone={colors.creamSoft}
                title={diaperLabel[d.kind]}
                subtitle={d.notes}
                meta={formatClock(d.at)}
                onPress={() => router.push({ pathname: '/changing/edit', params: { id: d.id } })}
                last={i === list.length - 1}
              />
            ))}
          </View>
        ))}
      </AsyncBlock>
    </Screen>
  );
}

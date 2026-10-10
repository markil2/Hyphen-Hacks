import { router } from 'expo-router';
import { View } from 'react-native';

import { AsyncBlock, Button, DemoNotice, EmptyState, Screen, Section, T } from '@/components/ui';
import { FeedingHistory } from '@/features/feeding/FeedingHistory';
import { useFeedings } from '@/features/feeding/model';
import { isToday } from '@/lib/time';
import { space } from '@/theme';

/** Today's feeds and recent history; tap an entry to fix or remove it. */
export default function FeedingDashboard() {
  const feedings = useFeedings();
  const earlier = feedings.items.filter((f) => !isToday(f.at));

  return (
    <Screen title="Feeding log" subtitle="Every feeding path is welcome here." back>
      <View style={{ flexDirection: 'row', gap: space.xs }}>
        <Button label="Log a feeding" icon="bottle" onPress={() => router.push('/kitchen/bottle')} style={{ flex: 1 }} />
        <Button label="Log a food" icon="bowl" variant="secondary" onPress={() => router.push('/kitchen/bowl')} style={{ flex: 1 }} />
      </View>

      <Section title="Today">
        <AsyncBlock
          status={feedings.status}
          error={feedings.error}
          onRetry={feedings.retry}
          loadingLabel="Loading feeds"
          isEmpty={feedings.today.length === 0}
          empty={<EmptyState icon="bottle" title="Nothing logged today" body="Feeds you log will show up here, newest first." />}>
          <FeedingHistory entries={feedings.today} showDay={false} />
        </AsyncBlock>
      </Section>

      {feedings.status === 'ready' && earlier.length ? (
        <Section title="Recent days">
          <FeedingHistory entries={earlier} limit={20} />
        </Section>
      ) : null}

      <T variant="caption">Tap any entry to correct the time or details, or to remove it.</T>
      <DemoNotice>Demo mode: this log lives on this device only and isn’t shared with anyone.</DemoNotice>
    </Screen>
  );
}

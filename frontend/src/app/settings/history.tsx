import { router } from 'expo-router';
import { useState } from 'react';

import { AsyncBlock, EmptyState, Screen, Segmented } from '@/components/ui';
import { FeedingHistory } from '@/features/feeding/FeedingHistory';
import { useFeedings } from '@/features/feeding/model';
import { SleepHistory } from '@/features/sleep/SleepHistory';
import { useSleep } from '@/features/sleep/useSleep';

export default function History() {
  const [tab, setTab] = useState<'sleep' | 'feeding'>('sleep');
  const sleep = useSleep();
  const feedings = useFeedings();

  return (
    <Screen back title="History" subtitle="Everything you’ve logged, newest first.">
      <Segmented label="History type" value={tab} onChange={setTab} options={[{ value: 'sleep', label: 'Sleep' }, { value: 'feeding', label: 'Feeding' }]} />
      {tab === 'sleep' ? (
        <AsyncBlock status={sleep.status} error={sleep.error} onRetry={sleep.retry} isEmpty={sleep.completed.length === 0} empty={<EmptyState icon="moon" title="No sleep logged yet" />}>
          <SleepHistory sessions={sleep.completed} onEdit={(s) => router.push({ pathname: '/nursery/edit', params: { id: s.id } })} />
        </AsyncBlock>
      ) : (
        <AsyncBlock status={feedings.status} error={feedings.error} onRetry={feedings.retry} isEmpty={feedings.items.length === 0} empty={<EmptyState icon="bottle" title="No feeds logged yet" />}>
          <FeedingHistory entries={feedings.items} />
        </AsyncBlock>
      )}
    </Screen>
  );
}

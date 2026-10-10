import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AsyncBlock, Button, EmptyState, Screen, Segmented, T } from '@/components/ui';
import { useSaved } from '@/features/saved/useSaved';
import { ageInMonths, relativeTime } from '@/lib/time';
import { stores, useCatalog, useCollection, useDoc } from '@/state';
import { colors, radius, space } from '@/theme';
import type { Activity } from '@/types';

export default function Activities() {
  const activities = useCatalog(stores.activities);
  const progress = useCollection(stores.activityProgress);
  const saved = useSaved('activity');
  const baby = useDoc(stores.baby).value;
  const months = baby ? ageInMonths(baby.birthDate) : 3;
  const [view, setView] = useState<'age' | 'saved' | 'all'>('age');

  const list = useMemo(() => {
    if (view === 'saved') return activities.items.filter((a) => saved.isSaved(a.id));
    if (view === 'age') return activities.items.filter((a) => months >= a.monthsFrom && months <= a.monthsTo);
    return activities.items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities.items, view, months, saved.items]);

  return (
    <Screen back title="Activities" subtitle="Small, gentle ideas. Try what suits you both.">
      <Segmented
        label="Which activities"
        value={view}
        onChange={setView}
        options={[
          { value: 'age', label: 'For this age' },
          { value: 'saved', label: `Saved · ${saved.items.length}` },
          { value: 'all', label: 'All' },
        ]}
      />
      <AsyncBlock
        status={activities.status}
        error={activities.error}
        onRetry={activities.retry}
        isEmpty={list.length === 0}
        empty={<EmptyState icon="play" title={view === 'saved' ? 'No saved activities' : 'Nothing here yet'} body={view === 'saved' ? 'Tap Save on an idea to keep it here.' : undefined} />}>
        <View style={{ gap: space.sm }}>
          {list.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              saved={saved.isSaved(a.id)}
              onSave={() => saved.toggle({ kind: 'activity', refId: a.id, title: a.title })}
              tried={progress.items.find((p) => p.activityId === a.id)?.triedAt}
              onTried={() => {
                const existing = progress.items.find((p) => p.activityId === a.id);
                return existing ? progress.remove(existing.id) : progress.create({ activityId: a.id, triedAt: new Date().toISOString() }, `tried:${a.id}`);
              }}
              busy={saved.isToggling(a.id) || progress.isBusy(`tried:${a.id}`)}
            />
          ))}
        </View>
      </AsyncBlock>
      <T variant="caption">Sample ideas kept on this device; not reviewed by a professional. Always supervise play.</T>
    </Screen>
  );
}

function ActivityCard({ activity, saved, onSave, tried, onTried, busy }: { activity: Activity; saved: boolean; onSave: () => void; tried?: string; onTried: () => void; busy: boolean }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
        <T variant="heading" style={{ flex: 1 }}>
          {activity.title}
        </T>
        <T variant="caption">About {activity.minutes} min</T>
      </View>
      <T>{activity.description}</T>
      <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap', marginTop: 4 }}>
        <Button label={tried ? `Tried ${relativeTime(tried)}` : 'Mark as tried'} icon={tried ? 'check' : undefined} size="sm" variant={tried ? 'sage' : 'secondary'} onPress={onTried} disabled={busy} accessibilityHint={tried ? 'Tap to unmark' : undefined} />
        <Button label={saved ? 'Saved' : 'Save'} icon="bookmark" size="sm" variant="quiet" onPress={onSave} disabled={busy} accessibilityHint={saved ? 'Tap to remove from saved' : undefined} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: space.md, gap: space.xs },
});

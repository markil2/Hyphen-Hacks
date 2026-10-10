import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AsyncBlock, Chip, DemoNotice, EmptyState, Screen, T, TextField } from '@/components/ui';
import { ExpertCard, topicLabel } from '@/features/support/ExpertCard';
import { fold } from '@/lib/text';
import { stores, useCatalog } from '@/state';
import { space } from '@/theme';
import type { SupportTopic } from '@/types';

const TOPICS: SupportTopic[] = ['sleep', 'feeding', 'soothing', 'development', 'recovery'];

export default function Experts() {
  const params = useLocalSearchParams<{ topic?: SupportTopic }>();
  const experts = useCatalog(stores.experts);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<SupportTopic | null>(params.topic ?? null);

  const results = useMemo(() => {
    const q = fold(query.trim());
    return experts.items.filter(
      (e) => (!topic || e.topics.includes(topic)) && (!q || [e.name, e.role, e.specialty].some((f) => fold(f).includes(q))),
    );
  }, [experts.items, query, topic]);

  return (
    <Screen back title="Find an expert" subtitle="People who support new parents.">
      <DemoNotice>These are fictional sample profiles that show how the directory will work. None of them are real people or currently available.</DemoNotice>
      <View style={{ gap: space.sm }}>
        <TextField label="Search" placeholder="Name, role or specialty" value={query} onChangeText={setQuery} autoCorrect={false} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          <Chip label="All" selected={!topic} onPress={() => setTopic(null)} />
          {TOPICS.map((t) => (
            <Chip key={t} label={topicLabel[t]} selected={topic === t} onPress={() => setTopic(topic === t ? null : t)} />
          ))}
        </View>
      </View>
      <View>
        <T variant="caption" accessibilityLiveRegion="polite">
          {experts.status === 'ready' ? `${results.length} profile${results.length === 1 ? '' : 's'}` : ' '}
        </T>
        <AsyncBlock
          status={experts.status}
          error={experts.error}
          onRetry={experts.retry}
          loadingLabel="Loading profiles"
          isEmpty={results.length === 0}
          empty={<EmptyState icon="search" title="No matching profiles" action={{ label: 'Clear filters', onPress: () => (setQuery(''), setTopic(null)) }} />}>
          {results.map((e) => (
            <ExpertCard key={e.id} expert={e} onPress={() => router.push({ pathname: '/support/expert/[id]', params: { id: e.id } })} />
          ))}
        </AsyncBlock>
      </View>
    </Screen>
  );
}

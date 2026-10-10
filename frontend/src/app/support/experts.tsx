import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AsyncBlock, Chip, EmptyState, Notice, Screen, T, TextField } from '@/components/ui';
import { ExpertCard, serviceLabel } from '@/features/support/ExpertCard';
import { fold } from '@/lib/text';
import { remote } from '@/services';
import { stores, useCatalog } from '@/state';
import { space } from '@/theme';

/** The expert directory: real external listings plus clearly-labelled demo profiles. */
export default function Experts() {
  const params = useLocalSearchParams<{ category?: string }>();
  const experts = useCatalog(stores.experts);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(params.category ?? null);

  useEffect(() => {
    remote.support.expertCategories().then(setCategories, () => setCategories([]));
  }, []);

  // The API filters by category; it has no text search, so names are matched on the phone.
  const results = useMemo(() => {
    const q = fold(query.trim());
    return experts.items.filter(
      (e) =>
        (!category || e.serviceCategory === category) &&
        (!q || [e.name, e.specialty, e.organization ?? '', serviceLabel(e.serviceCategory)].some((f) => fold(f).includes(q))),
    );
  }, [experts.items, query, category]);

  return (
    <Screen back title="Find an expert" subtitle="People and services that support new families.">
      <Notice
        tone="sand"
        text="Listings are public directory information. Nurture has no partnership with these providers and hasn’t verified their credentials, availability or cost. Profiles marked ‘Fictional demo profile’ aren’t real people."
      />
      <View style={{ gap: space.sm }}>
        <TextField label="Search" placeholder="Name, specialty or organization" value={query} onChangeText={setQuery} autoCorrect={false} />
        {categories.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityLabel="Filter by service">
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip key={c} label={serviceLabel(c)} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
            ))}
          </View>
        ) : null}
      </View>
      <View>
        <T variant="caption" accessibilityLiveRegion="polite">
          {experts.status === 'ready' ? `${results.length} listing${results.length === 1 ? '' : 's'}` : ' '}
        </T>
        <AsyncBlock
          status={experts.status}
          error={experts.error}
          onRetry={experts.retry}
          loadingLabel="Loading the directory"
          isEmpty={results.length === 0}
          empty={<EmptyState icon="search" title="No matching listings" action={{ label: 'Clear filters', onPress: () => (setQuery(''), setCategory(null)) }} />}>
          {results.map((e) => (
            <ExpertCard key={e.id} expert={e} onPress={() => router.push({ pathname: '/support/expert/[id]', params: { id: e.id } })} />
          ))}
        </AsyncBlock>
      </View>
    </Screen>
  );
}

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons';
import { AsyncBlock, Chip, DemoNotice, EmptyState, Screen, T, TextField } from '@/components/ui';
import { categoryLabel, ProductCard } from '@/features/pantry/ProductCard';
import { useSaved } from '@/features/saved/useSaved';
import { fold } from '@/lib/text';
import { stores, useCatalog } from '@/state';
import { colors, space } from '@/theme';
import type { ProductCategory } from '@/types';

/** Searchable product information. Listings are informational, never recommendations. */
export default function Pantry() {
  const products = useCatalog(stores.products);
  const saved = useSaved('product');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');

  const results = useMemo(() => {
    const q = fold(query.trim());
    return products.items.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (!q || [p.name, p.brand, p.summary, categoryLabel[p.category]].some((field) => fold(field).includes(q))),
    );
  }, [products.items, query, category]);

  return (
    <Screen
      title="Pantry"
      subtitle="Formula, baby food and nutrition information."
      back
      right={
        <Chip label={`Saved · ${saved.items.length}`} icon="bookmark" onPress={() => router.push('/kitchen/saved')} />
      }>
      <DemoNotice>
        Every listing here is example content for the demo. None of it has been reviewed by a professional, and nothing is a
        recommendation for your baby.
      </DemoNotice>

      <View style={{ gap: space.sm }}>
        <TextField
          label="Search"
          placeholder="Search by name or type"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityRole="radiogroup" accessibilityLabel="Category">
          <Chip label="All" selected={category === 'all'} onPress={() => setCategory('all')} />
          {(Object.keys(categoryLabel) as ProductCategory[]).map((c) => (
            <Chip key={c} label={categoryLabel[c]} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
      </View>

      <View>
        <T variant="caption" accessibilityLiveRegion="polite">
          {products.status === 'ready' ? `${results.length} result${results.length === 1 ? '' : 's'}` : ' '}
        </T>
        <AsyncBlock
          status={products.status}
          error={products.error}
          onRetry={products.retry}
          loadingLabel="Loading pantry"
          isEmpty={results.length === 0}
          empty={
            <EmptyState
              icon="search"
              title="No matches"
              body={query ? `Nothing in the demo list matches “${query}”.` : 'Nothing in this category yet.'}
              action={{ label: 'Clear search', onPress: () => (setQuery(''), setCategory('all')) }}
            />
          }>
          {results.map((p) => (
            <ProductCard key={p.id} product={p} saved={saved.isSaved(p.id)} onPress={() => router.push({ pathname: '/kitchen/product/[id]', params: { id: p.id } })} />
          ))}
        </AsyncBlock>
      </View>

      <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'flex-start' }}>
        <Icon name="heart" size={18} color={colors.ink2} />
        <T variant="small" style={{ flex: 1 }}>
          Breast milk, formula, or both — every family feeds differently. Bring questions to your pediatrician; they know your baby.
        </T>
      </View>
    </Screen>
  );
}

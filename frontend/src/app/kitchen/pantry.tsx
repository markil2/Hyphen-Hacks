import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons';
import { AsyncBlock, Chip, EmptyState, ErrorState, LoadingState, Notice, Screen, Section, SourceLink, T, TextField } from '@/components/ui';
import { categoryLabel, ProductCard } from '@/features/pantry/ProductCard';
import { useSaved } from '@/features/saved/useSaved';
import { remote } from '@/services';
import { stores, useCatalog } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { Product } from '@/types';

/** Searchable product information and source-linked reading. Informational, never a recommendation. */
export default function Pantry() {
  const products = useCatalog(stores.products);
  const resources = useCatalog(stores.resources);
  const saved = useSaved('product');
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [searched, setSearched] = useState<{ q: string; items: Product[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    remote.catalog.productCategories().then(setCategories, () => setCategories([]));
  }, []);

  // Search runs on the server (/nutrition/search), debounced while typing.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let live = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const items = await remote.catalog.searchProducts(q);
        if (live) {
          setSearched({ q, items });
          setSearchError(null);
        }
      } catch (e) {
        if (live) setSearchError(messageOf(e));
      } finally {
        if (live) setSearching(false);
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const q = query.trim();
  const activeSearch = q && searched?.q === q ? searched : null;
  const base = activeSearch ? activeSearch.items : products.items;
  const results = useMemo(() => base.filter((p) => !category || p.category === category), [base, category]);

  return (
    <Screen title="Pantry" subtitle="Formula, solids, and reading from trusted sources." back right={<Chip label={`Saved · ${saved.items.length}`} icon="bookmark" onPress={() => router.push('/kitchen/saved')} />}>
      <Notice
        tone="sand"
        text="Product records are samples for the app’s interface — not recommendations or endorsements. Always check the manufacturer’s label, and ask your pediatrician about what suits your baby."
      />

      <View style={{ gap: space.sm }}>
        <TextField label="Search products" placeholder="Name, brand or type" value={query} onChangeText={setQuery} returnKeyType="search" autoCorrect={false} />
        {categories.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityLabel="Category">
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
            {categories.map((c) => (
              <Chip key={c} label={categoryLabel(c)} selected={category === c} onPress={() => setCategory(category === c ? null : c)} />
            ))}
          </View>
        ) : null}
      </View>

      <View>
        <T variant="caption" accessibilityLiveRegion="polite">
          {q && searching ? 'Searching…' : products.status === 'ready' ? `${results.length} product${results.length === 1 ? '' : 's'}` : ' '}
        </T>
        {q && searchError ? (
          <ErrorState message={searchError} onRetry={() => setQuery((q) => `${q} `.trimEnd())} />
        ) : (
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
                body={query ? `Nothing matches “${query.trim()}”.` : 'Nothing in this category yet.'}
                action={{ label: 'Clear search', onPress: () => (setQuery(''), setCategory(null)) }}
              />
            }>
            {results.map((p) => (
              <ProductCard key={p.id} product={p} saved={saved.isSaved(p.id)} onPress={() => router.push({ pathname: '/kitchen/product/[id]', params: { id: p.id } })} />
            ))}
          </AsyncBlock>
        )}
      </View>

      <Section title="Learn">
        {resources.status === 'error' ? (
          <ErrorState message={resources.error} onRetry={resources.retry} />
        ) : resources.status !== 'ready' ? (
          <LoadingState />
        ) : (
          resources.items.map((r) => (
            <View key={r.id} style={{ gap: 2, paddingVertical: space.xs }}>
              <T variant="bodyStrong">{r.title}</T>
              <T variant="small">{r.description}</T>
              <SourceLink url={r.sourceUrl} label={r.sourceName} />
            </View>
          ))
        )}
      </Section>

      <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'flex-start' }}>
        <Icon name="heart" size={18} color={colors.ink2} />
        <T variant="small" style={{ flex: 1 }}>
          Breast milk, formula, or both — every family feeds differently.
        </T>
      </View>
    </Screen>
  );
}

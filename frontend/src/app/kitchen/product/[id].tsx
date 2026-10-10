import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, ErrorState, LoadingState, Notice, Panel, Screen, Section, SourceLink, StatusBadge, T, TextField } from '@/components/ui';
import { categoryLabel, ProductArt } from '@/features/pantry/ProductCard';
import { useSaved } from '@/features/saved/useSaved';
import { remote } from '@/services';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { Product } from '@/types';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string>();
  const saved = useSaved('product');
  const notes = useCollection(stores.pediatricianNotes);
  const [question, setQuestion] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    remote.catalog.productDetail(id).then(
      (res) => {
        if (!live) return;
        setProduct(res.product);
        setDisclaimer(res.disclaimer);
        setStatus('ready');
      },
      (e) => {
        if (!live) return;
        setLoadError(messageOf(e));
        setStatus('error');
      },
    );
    return () => {
      live = false;
    };
  }, [id, attempt]);
  const retry = () => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  };

  if (status === 'loading') return <Screen back><LoadingState /></Screen>;
  if (status === 'error' || !product) return <Screen back><ErrorState message={loadError} onRetry={retry} /></Screen>;

  const isSaved = saved.isSaved(product.id);

  const addQuestion = async () => {
    if (!question.trim()) return;
    setError(null);
    try {
      await notes.create({ text: question.trim(), createdAt: new Date().toISOString(), context: product.name }, 'create:pedi');
      setQuestion('');
      setAdded(true);
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen back>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <ProductArt category={product.category} size={84} />
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="caption">
            {categoryLabel(product.category)} · {product.brand}
          </T>
          <T variant="title" accessibilityRole="header">
            {product.name}
          </T>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {product.isSample ? <T variant="caption" style={{ color: colors.blueDeep }}>Sample record</T> : null}
        <StatusBadge status={product.expertReviewStatus} />
      </View>

      {/* The backend asks clients to show this alongside product details. */}
      <Notice tone="sand" text={disclaimer} />

      <T>{product.description}</T>

      <Section title="Details">
        <Panel>
          <T variant="smallStrong">Ingredients</T>
          <T variant="small">{product.ingredients}</T>
          <T variant="smallStrong">Age guidance</T>
          <T variant="small">{product.ageGuidance}</T>
          <T variant="smallStrong">Source</T>
          <SourceLink url={product.sourceUrl} />
        </Panel>
      </Section>

      <Button
        label={isSaved ? 'Saved — tap to remove' : 'Save to my list'}
        icon="bookmark"
        variant={isSaved ? 'secondary' : 'primary'}
        loading={saved.isToggling(product.id)}
        onPress={() => saved.toggle({ kind: 'product', refId: product.id, title: product.name })}
      />

      <Section title="Ask your pediatrician">
        <TextField
          label="Add a question to bring to your next appointment"
          placeholder="e.g. Is this a good fit for us?"
          value={question}
          onChangeText={(t) => {
            setQuestion(t);
            setAdded(false);
          }}
          multiline
          error={error ?? undefined}
        />
        <Button label="Add question" variant="secondary" icon="plus" onPress={addQuestion} disabled={!question.trim()} loading={notes.isBusy('create:pedi')} />
        {added ? (
          <T variant="small" style={{ color: colors.sageDeep }} accessibilityLiveRegion="polite">
            Added to your list (Pantry → Saved). Kept on this phone.
          </T>
        ) : null}
      </Section>
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, DemoBadge, EmptyState, LoadingState, Panel, Screen, Section, SourceList, T, TextField, VerificationBadge } from '@/components/ui';
import { categoryLabel, ProductArt } from '@/features/pantry/ProductCard';
import { useSaved } from '@/features/saved/useSaved';
import { stores, useCatalog, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const products = useCatalog(stores.products);
  const product = products.items.find((p) => p.id === id);
  const saved = useSaved('product');
  const notes = useCollection(stores.pediatricianNotes);
  const [question, setQuestion] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) {
    return (
      <Screen back title="Product">
        {products.status === 'ready' ? <EmptyState title="This listing isn’t available" /> : <LoadingState />}
      </Screen>
    );
  }

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
        <ProductArt category={product.category} size={88} />
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="caption">
            {categoryLabel[product.category]} · {product.brand}
          </T>
          <T variant="title" accessibilityRole="header">
            {product.name}
          </T>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <DemoBadge origin={product.origin} label="Example listing" />
        <VerificationBadge verification={product.verification} />
      </View>

      <T variant="lead">{product.summary}</T>
      {product.details.map((d) => (
        <T key={d}>{d}</T>
      ))}
      {product.ageRange ? <T variant="small">Age range shown on listing: {product.ageRange}</T> : null}

      <Button
        label={isSaved ? 'Saved — tap to remove' : 'Save to my list'}
        icon="bookmark"
        variant={isSaved ? 'secondary' : 'primary'}
        loading={saved.isToggling(product.id)}
        onPress={() => saved.toggle({ kind: 'product', refId: product.id, title: product.name })}
      />

      <Section title="Sources & review">
        <Panel>
          <SourceList verification={product.verification} />
          <T variant="caption">
            An informational listing is not an expert recommendation. No product is right for every baby.
          </T>
        </Panel>
      </Section>

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
            Added to your pediatrician list (Pantry → Saved).
          </T>
        ) : null}
      </Section>
    </Screen>
  );
}

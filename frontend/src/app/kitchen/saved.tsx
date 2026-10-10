import { router } from 'expo-router';

import { AsyncBlock, EmptyState, IconButton, ListRow, Screen, Section } from '@/components/ui';
import { useSaved } from '@/features/saved/useSaved';
import { relativeTime } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { colors } from '@/theme';

/** Saved products and questions to raise with a pediatrician. */
export default function Saved() {
  const saved = useSaved('product');
  const notes = useCollection(stores.pediatricianNotes);

  return (
    <Screen title="Saved" subtitle="Products you bookmarked and questions for your pediatrician." back>
      <Section title="Products">
        <AsyncBlock
          status={saved.status}
          error={saved.error}
          onRetry={saved.retry}
          isEmpty={saved.items.length === 0}
          empty={<EmptyState icon="bookmark" title="No saved products" body="Tap “Save to my list” on any pantry listing." action={{ label: 'Browse the pantry', onPress: () => router.push('/kitchen/pantry') }} />}>
          {saved.items.map((s, i) => (
            <ListRow
              key={s.id}
              icon="pantry"
              iconTone={colors.terracottaWash}
              title={s.title}
              subtitle={`Saved ${relativeTime(s.savedAt)}`}
              onPress={() => router.push({ pathname: '/kitchen/product/[id]', params: { id: s.refId } })}
              last={i === saved.items.length - 1}
              right={<IconButton icon="trash" label={`Remove ${s.title} from saved`} tone="clear" onPress={() => saved.remove(s.id)} disabled={saved.isBusy(`remove:${s.id}`)} />}
            />
          ))}
        </AsyncBlock>
      </Section>

      <Section title="Questions for your pediatrician">
        <AsyncBlock
          status={notes.status}
          error={notes.error}
          onRetry={notes.retry}
          isEmpty={notes.items.length === 0}
          empty={<EmptyState icon="support" title="No questions yet" body="Add them from any product or from the Development room." />}>
          {notes.items.map((n, i) => (
            <ListRow
              key={n.id}
              icon="support"
              iconTone={colors.sageWash}
              title={n.text}
              subtitle={n.context ? `From ${n.context}` : undefined}
              last={i === notes.items.length - 1}
              right={<IconButton icon="trash" label="Remove question" tone="clear" onPress={() => notes.remove(n.id)} disabled={notes.isBusy(`remove:${n.id}`)} />}
            />
          ))}
        </AsyncBlock>
      </Section>
    </Screen>
  );
}

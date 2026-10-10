import { router } from 'expo-router';

import type { IconName } from '@/components/icons';
import { AsyncBlock, EmptyState, IconButton, ListRow, Screen } from '@/components/ui';
import { useSaved } from '@/features/saved/useSaved';
import { relativeTime } from '@/lib/time';
import type { SavedItem } from '@/types';

const kindInfo: Record<SavedItem['kind'], { label: string; icon: IconName }> = {
  product: { label: 'Product', icon: 'pantry' },
  resource: { label: 'Reading', icon: 'leaf' },
  activity: { label: 'Play idea', icon: 'play' },
  expert: { label: 'Expert', icon: 'support' },
};

function open(item: SavedItem) {
  if (item.kind === 'product') router.push({ pathname: '/kitchen/product/[id]', params: { id: item.refId } });
  else if (item.kind === 'expert') router.push({ pathname: '/support/expert/[id]', params: { id: item.refId } });
  else if (item.kind === 'activity') router.push('/development/activities');
}

/** Bookmarks live on this phone; the backend has no saved-items endpoint yet. */
export default function AllSaved() {
  const saved = useSaved();
  return (
    <Screen back title="Saved" subtitle="Everything you bookmarked. Kept on this phone.">
      <AsyncBlock
        status={saved.status}
        error={saved.error}
        onRetry={saved.retry}
        isEmpty={saved.items.length === 0}
        empty={<EmptyState icon="bookmark" title="Nothing saved yet" body="Look for the bookmark on products and play ideas." />}>
        {saved.items.map((s, i) => (
          <ListRow
            key={s.id}
            icon={kindInfo[s.kind].icon}
            title={s.title}
            subtitle={`${kindInfo[s.kind].label} · saved ${relativeTime(s.savedAt)}`}
            onPress={s.kind === 'resource' ? undefined : () => open(s)}
            last={i === saved.items.length - 1}
            right={<IconButton icon="trash" label={`Remove ${s.title}`} tone="clear" onPress={() => saved.remove(s.id)} disabled={saved.isBusy(`remove:${s.id}`)} />}
          />
        ))}
      </AsyncBlock>
    </Screen>
  );
}

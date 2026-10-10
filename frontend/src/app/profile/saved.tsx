import { router } from 'expo-router';

import { AsyncBlock, EmptyState, IconButton, ListRow, Screen } from '@/components/ui';
import type { IconName } from '@/components/icons';
import { useSaved } from '@/features/saved/useSaved';
import { relativeTime } from '@/lib/time';
import type { SavedItem } from '@/types';

const kindInfo: Record<SavedItem['kind'], { label: string; icon: IconName }> = {
  product: { label: 'Product', icon: 'pantry' },
  resource: { label: 'Resource', icon: 'leaf' },
  answer: { label: 'Saved answer', icon: 'support' },
  activity: { label: 'Activity', icon: 'play' },
  post: { label: 'Community post', icon: 'community' },
};

function open(item: SavedItem) {
  if (item.kind === 'product') router.push({ pathname: '/kitchen/product/[id]', params: { id: item.refId } });
  else if (item.kind === 'post') router.push({ pathname: '/community/[id]', params: { id: item.refId } });
  else if (item.kind === 'activity') router.push('/development/activities');
  else router.push('/support/questions');
}

export default function AllSaved() {
  const saved = useSaved();
  return (
    <Screen back title="Saved" subtitle="Everything you bookmarked, in one place.">
      <AsyncBlock
        status={saved.status}
        error={saved.error}
        onRetry={saved.retry}
        isEmpty={saved.items.length === 0}
        empty={<EmptyState icon="bookmark" title="Nothing saved yet" body="Look for the bookmark on products, answers, activities and posts." />}>
        {saved.items.map((s, i) => (
          <ListRow
            key={s.id}
            icon={kindInfo[s.kind].icon}
            title={s.title}
            subtitle={`${kindInfo[s.kind].label} · saved ${relativeTime(s.savedAt)}`}
            onPress={() => open(s)}
            last={i === saved.items.length - 1}
            right={<IconButton icon="trash" label={`Remove ${s.title}`} tone="clear" onPress={() => saved.remove(s.id)} disabled={saved.isBusy(`remove:${s.id}`)} />}
          />
        ))}
      </AsyncBlock>
    </Screen>
  );
}

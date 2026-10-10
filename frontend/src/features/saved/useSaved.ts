import { stores, useCollection } from '@/state';
import type { SavedItem } from '@/types';

/** Bookmarks for products, answers, activities and posts. */
export function useSaved(kind?: SavedItem['kind']) {
  const saved = useCollection(stores.saved);
  const items = kind ? saved.items.filter((s) => s.kind === kind) : saved.items;
  const find = (refId: string) => saved.items.find((s) => s.refId === refId);

  return {
    ...saved,
    items,
    isSaved: (refId: string) => Boolean(find(refId)),
    isToggling: (refId: string) => saved.isBusy(`save:${refId}`) || Boolean(find(refId) && saved.isBusy(`remove:${find(refId)!.id}`)),
    toggle: async (item: Pick<SavedItem, 'kind' | 'refId' | 'title'>) => {
      const existing = find(item.refId);
      if (existing) return saved.remove(existing.id);
      await saved.create({ ...item, savedAt: new Date().toISOString() }, `save:${item.refId}`);
    },
  };
}

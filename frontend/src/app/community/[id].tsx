import { useLocalSearchParams } from 'expo-router';

import { EmptyState, LoadingState, Panel, Screen, T } from '@/components/ui';
import { CommunityPost } from '@/features/community/CommunityPost';
import { useSaved } from '@/features/saved/useSaved';
import { stores, useCatalog, useCollection } from '@/state';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const posts = useCollection(stores.posts);
  const groups = useCatalog(stores.groups);
  const saved = useSaved('post');
  const post = posts.items.find((p) => p.id === id);

  if (!post) return <Screen back>{posts.status === 'ready' ? <EmptyState title="This post isn’t available" /> : <LoadingState />}</Screen>;

  return (
    <Screen back>
      <CommunityPost
        post={post}
        group={groups.items.find((g) => g.id === post.groupId)}
        saved={saved.isSaved(post.id)}
        onSave={() => saved.toggle({ kind: 'post', refId: post.id, title: post.title })}
        onHide={(hidden) => posts.update(post.id, { hidden })}
        onReport={() => posts.update(post.id, { reported: true, hidden: true })}
      />
      <Panel tone="blue">
        <T variant="small">
          Replies aren’t part of the demo yet. When the community backend is connected, the conversation will appear here.
        </T>
      </Panel>
    </Screen>
  );
}

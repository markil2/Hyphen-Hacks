import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsyncBlock, Button, Chip, DemoNotice, EmptyState, T } from '@/components/ui';
import { CommunityPost } from '@/features/community/CommunityPost';
import { useSaved } from '@/features/saved/useSaved';
import { stores, useCatalog, useCollection } from '@/state';
import { colors, space } from '@/theme';

export default function Community() {
  const insets = useSafeAreaInsets();
  const groups = useCatalog(stores.groups);
  const posts = useCollection(stores.posts);
  const saved = useSaved('post');
  const [group, setGroup] = useState<string | null>(null);
  const list = posts.items.filter((p) => !group || p.groupId === group);

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: space.xxl, paddingHorizontal: space.lg - 4, gap: space.lg }}>
      <View style={{ gap: space.xxs }}>
        <T variant="hero" accessibilityRole="header">
          Community
        </T>
        <T variant="lead">Other parents, in the thick of it too. Kindness first; no comparisons.</T>
      </View>

      <DemoNotice>Posts here are written samples, not real people. Anything you post stays on this device.</DemoNotice>

      <View style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityLabel="Groups">
          <Chip label="All groups" selected={!group} onPress={() => setGroup(null)} />
          {groups.items.map((g) => (
            <Chip key={g.id} label={g.name} selected={group === g.id} onPress={() => setGroup(group === g.id ? null : g.id)} />
          ))}
        </View>
        {group ? <T variant="small">{groups.items.find((g) => g.id === group)?.description}</T> : null}
      </View>

      <Button label="Write a post" icon="edit" onPress={() => router.push({ pathname: '/community/new', params: group ? { group } : {} })} />

      <AsyncBlock
        status={posts.status}
        error={posts.error}
        onRetry={posts.retry}
        isEmpty={list.length === 0}
        empty={<EmptyState icon="community" title="No posts in this group yet" body="Start the conversation — gently." />}>
        <View style={{ gap: space.sm }}>
          {list.map((p) => (
            <CommunityPost
              key={p.id}
              post={p}
              group={groups.items.find((g) => g.id === p.groupId)}
              saved={saved.isSaved(p.id)}
              onSave={() => saved.toggle({ kind: 'post', refId: p.id, title: p.title })}
              onHide={(hidden) => posts.update(p.id, { hidden })}
              onReport={() => posts.update(p.id, { reported: true, hidden: true })}
              onOpen={() => router.push({ pathname: '/community/[id]', params: { id: p.id } })}
            />
          ))}
        </View>
      </AsyncBlock>
    </ScrollView>
  );
}

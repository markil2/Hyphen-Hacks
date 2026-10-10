import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Chip, DemoBadge, IconButton, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { relativeTime } from '@/lib/time';
import { colors, radius, space } from '@/theme';
import type { CommunityGroup, Post } from '@/types';

const REASONS = ['Unkind or harmful', 'Medical misinformation', 'Spam', 'Something else'];

/** A discussion preview with save, hide and report — moderation is visible, not buried. */
export function CommunityPost({
  post,
  group,
  saved,
  onSave,
  onHide,
  onReport,
  onOpen,
}: {
  post: Post;
  group?: CommunityGroup;
  saved: boolean;
  onSave: () => void;
  onHide: (hidden: boolean) => void;
  onReport: () => void;
  onOpen?: () => void;
}) {
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  if (post.hidden) {
    return (
      <View style={[styles.card, styles.hidden]}>
        <Icon name="eyeOff" size={18} color={colors.ink2} />
        <T variant="small" style={{ flex: 1 }}>
          {post.reported ? 'You reported and hid this post.' : 'You hid this post.'}
        </T>
        <Button label="Show" size="sm" variant="quiet" onPress={() => onHide(false)} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole={onOpen ? 'button' : undefined}
        disabled={!onOpen}
        onPress={() => {
          haptic.tap();
          onOpen?.();
        }}
        style={{ gap: space.xs }}>
        <View style={styles.meta}>
          <T variant="caption">
            {group?.name ?? 'Group'} · {post.mine ? 'You' : post.author} · {relativeTime(post.createdAt)}
          </T>
          {post.origin === 'demo' ? <DemoBadge label={post.mine ? 'Demo post' : 'Sample post'} /> : null}
        </View>
        <T variant="heading">{post.title}</T>
        <T numberOfLines={onOpen ? 3 : undefined}>{post.body}</T>
      </Pressable>

      <View style={styles.actions}>
        <T variant="caption" style={{ flex: 1 }}>
          {post.mine ? 'Only on this device' : `${post.replies} replies`}
        </T>
        <IconButton icon="bookmark" label={saved ? 'Remove from saved' : 'Save post'} tone="clear" size={40} color={saved ? colors.terracottaDeep : colors.ink2} onPress={onSave} />
        {!post.mine ? (
          <>
            <IconButton icon="eyeOff" label="Hide post" tone="clear" size={40} color={colors.ink2} onPress={() => onHide(true)} />
            <IconButton icon="flag" label={post.reported ? 'Reported' : 'Report post'} tone="clear" size={40} color={post.reported ? colors.danger : colors.ink2} onPress={() => setReporting((r) => !r)} />
          </>
        ) : null}
      </View>

      {reporting && !post.reported ? (
        <View style={styles.report}>
          <T variant="smallStrong">What’s wrong with this post?</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {REASONS.map((r) => (
              <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Button label="Report and hide" size="sm" variant="danger" disabled={!reason} onPress={() => (onReport(), setReporting(false))} />
            <Button label="Cancel" size="sm" variant="quiet" onPress={() => setReporting(false)} />
          </View>
          <T variant="caption">Demo: reports stay on this device. In the real app a moderator would review them.</T>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: space.md, gap: space.xs },
  hidden: { flexDirection: 'row', alignItems: 'center', gap: space.sm, backgroundColor: 'transparent', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lineStrong },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  report: { gap: space.xs, paddingTop: space.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineStrong },
});

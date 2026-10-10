import { router } from 'expo-router';
import { useEffect } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icons';
import { RoomThumb } from '@/components/scene/RoomThumb';
import { Button, DemoBadge, ErrorState, ListRow, Panel, Section, T } from '@/components/ui';
import { PAGES, RoomId, usePager } from '@/features/navigation/PagerContext';
import { BabyAvatar } from '@/features/profile/BabyAvatar';
import { ROOMS } from '@/features/rooms/rooms';
import { useSaved } from '@/features/saved/useSaved';
import { hm } from '@/features/sleep/sleepStats';
import { useSleep } from '@/features/sleep/useSleep';
import { haptic } from '@/lib/haptics';
import { babyAge, formatClock, greeting, relativeTime, useNow } from '@/lib/time';
import { stores, useDoc } from '@/state';
import { colors, fonts, radius, shadow, space } from '@/theme';
import type { DashboardSummary, TimelineEvent } from '@/types';

const eventIcon: Record<TimelineEvent['type'], IconName> = {
  sleep: 'moon',
  feeding: 'bottle',
  diaper: 'diaper',
  question: 'support',
  height: 'ruler',
  milestone: 'sprout',
  health: 'heart',
};
const eventRoom: Partial<Record<TimelineEvent['type'], RoomId>> = { sleep: 'nursery', feeding: 'kitchen', diaper: 'changing', height: 'play', milestone: 'play', question: 'living' };

/** Home sits above the rooms: a calm summary of the day, and ways back in. */
export function HomePage() {
  const insets = useSafeAreaInsets();
  const pager = usePager();
  const now = useNow(30_000);
  const baby = useDoc(stores.baby);
  const account = useDoc(stores.account);
  const summary = useDoc(stores.dashboard);
  const timeline = useDoc(stores.timeline);
  const sleep = useSleep();
  const saved = useSaved();

  // Refresh whenever Home comes into view.
  useEffect(() => {
    if (pager.page === PAGES.home) {
      summary.retry();
      timeline.retry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pager.page]);

  // Dragging past the bottom of Home returns to the rooms.
  const onEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height > contentSize.height + 70) pager.goTo('rooms');
  };

  const firstName = account.value?.name?.split(' ')[0];
  const s = summary.value;

  return (
    <ScrollView
      style={{ backgroundColor: colors.cream }}
      onScrollEndDrag={onEndDrag}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg, paddingHorizontal: space.lg - 4, gap: space.lg }}>
      <View style={{ gap: space.md }}>
        <T variant="hero" accessibilityRole="header">
          {greeting(new Date(now))}
          {firstName ? `, ${firstName}` : ''}
        </T>
        <View style={styles.baby}>
          <BabyAvatar size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="heading">{baby.value?.name ?? (baby.status === 'error' ? 'Baby profile' : ' ')}</T>
            <T variant="small">{baby.value ? babyAge(baby.value.birthDate, now) : baby.status === 'error' ? 'Couldn’t load' : ' '}</T>
          </View>
          <DemoBadge origin={baby.value?.origin ?? 'api'} label="Offline demo" />
        </View>
      </View>

      {sleep.active ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sleep session in progress since ${formatClock(sleep.active.startedAt)}. Go to the nursery`}
          onPress={() => pager.goToRoom('nursery')}
          style={[styles.live, shadow.soft]}>
          <Icon name="moon" color={colors.lampGlow} />
          <View style={{ flex: 1 }}>
            <T variant="smallStrong" style={{ color: colors.warmWhite }}>
              Sleep session in progress
            </T>
            <T variant="small" style={{ color: 'rgba(245,240,231,0.8)' }}>
              Since {formatClock(sleep.active.startedAt)} · {hm((now - new Date(sleep.active.startedAt).getTime()) / 60000)} so far
            </T>
          </View>
          <Icon name="chevron" color={colors.warmWhite} />
        </Pressable>
      ) : null}

      <Section title="Today so far">
        {summary.status === 'error' ? (
          <ErrorState message={summary.error} onRetry={summary.retry} />
        ) : (
          <T variant="lead" accessibilityLiveRegion="polite">
            {s ? todaySentence(baby.value?.name ?? 'Your baby', s) : 'Gathering today’s notes…'}
          </T>
        )}
        <T variant="caption">Every day looks different. These are just your notes, not a score.</T>
      </Section>

      <Panel tone="sage" style={{ padding: space.lg - 4, gap: space.sm }}>
        <T variant="title">Need a hand?</T>
        <T style={{ color: colors.ink2 }}>Ask in your own words and see which kinds of professionals can help.</T>
        <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
          <Button label="Ask a question" icon="support" variant="sage" onPress={() => router.push('/support/ask')} style={{ flexGrow: 1 }} />
          <Button label="Find an expert" variant="secondary" onPress={() => router.push('/support/experts')} style={{ flexGrow: 1 }} />
        </View>
      </Panel>

      <Section title="Step into a room">
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <RoomTile id="nursery" note={sleep.active ? 'Session running' : 'Monitor & sleep'} onPress={() => pager.goToRoom('nursery')} />
          <RoomTile id="kitchen" note="Feeding & pantry" onPress={() => pager.goToRoom('kitchen')} />
        </View>
      </Section>

      <Section title="Recent activity">
        {timeline.status === 'error' ? (
          <ErrorState message={timeline.error} onRetry={timeline.retry} />
        ) : timeline.value?.length ? (
          timeline.value.slice(0, 5).map((e, i, arr) => (
            <ListRow
              key={`${e.type}-${e.at}-${i}`}
              icon={eventIcon[e.type]}
              title={e.title}
              meta={relativeTime(e.at, now)}
              onPress={eventRoom[e.type] ? () => pager.goToRoom(eventRoom[e.type]!) : undefined}
              last={i === arr.length - 1}
            />
          ))
        ) : (
          <T variant="small">{timeline.status === 'ready' ? 'Nothing logged yet. Notes you add in the rooms show up here.' : 'Loading…'}</T>
        )}
      </Section>

      {saved.items.length ? (
        <Section title="Saved for later" action={{ label: 'See all', onPress: () => router.push('/settings/saved') }}>
          {saved.items.slice(0, 2).map((x, i, arr) => (
            <ListRow key={x.id} icon="bookmark" title={x.title} subtitle={`Saved ${relativeTime(x.savedAt, now)}`} last={i === arr.length - 1} />
          ))}
        </Section>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back down to the rooms"
        accessibilityHint="You can also drag past the bottom"
        onPress={() => {
          haptic.tap();
          pager.goTo('rooms');
        }}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
        <T style={styles.backText}>Back to the rooms</T>
        <Icon name="down" size={16} color={colors.ink2} strokeWidth={2} />
      </Pressable>
    </ScrollView>
  );
}

function todaySentence(name: string, s: DashboardSummary) {
  const parts = [
    s.todaySleepMinutes ? `${name} has about ${hm(s.todaySleepMinutes)} of logged sleep.` : 'No finished sleep logged yet today.',
    s.feedingsToday ? `${s.feedingsToday} feed${s.feedingsToday === 1 ? '' : 's'} logged${s.lastFeedingAt ? `, the latest at ${formatClock(s.lastFeedingAt)}` : ''}.` : 'No feeds logged yet.',
    s.diapersToday ? `${s.diapersToday} diaper change${s.diapersToday === 1 ? '' : 's'}.` : '',
  ];
  return parts.filter(Boolean).join(' ');
}

function RoomTile({ id, note, onPress }: { id: RoomId; note: string; onPress: () => void }) {
  const room = ROOMS[id];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Go to the ${room.name}: ${note}`}
      onPress={() => {
        haptic.soft();
        onPress();
      }}
      style={({ pressed }) => [styles.tile, shadow.soft, pressed && { transform: [{ scale: 0.985 }] }]}>
      <RoomThumb art={room.art} crop={room.crop} height={124} />
      <View style={styles.tileText}>
        <T style={styles.tileName}>{room.name}</T>
        <T variant="caption">{note}</T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baby: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  live: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.night },
  tile: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.warmWhite },
  tileText: { padding: space.sm, gap: 1 },
  tileName: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22, color: colors.charcoal },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48, marginTop: space.sm },
  backText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink2 },
});

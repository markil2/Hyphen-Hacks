import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/icons';
import { RoomThumb } from '@/components/scene/RoomThumb';
import { Button, Chip, DemoBadge, ListRow, Panel, Section, T } from '@/components/ui';
import { diaperLabel, useDiapers } from '@/features/diapers/model';
import { feedingDetail, feedingTitle, useFeedings } from '@/features/feeding/model';
import { BabyAvatar } from '@/features/profile/BabyAvatar';
import { ROOMS, RoomInfo } from '@/features/rooms/rooms';
import { useSaved } from '@/features/saved/useSaved';
import { durationOf, useSleep } from '@/features/sleep/useSleep';
import { ExpertCard, topicLabel } from '@/features/support/ExpertCard';
import { haptic } from '@/lib/haptics';
import { babyAge, formatClock, formatDuration, greeting, relativeTime, useNow } from '@/lib/time';
import { stores, useCatalog, useDoc } from '@/state';
import { colors, fonts, radius, shadow, space } from '@/theme';
import type { SupportTopic } from '@/types';

export default function Home() {
  const insets = useSafeAreaInsets();
  const now = useNow(30_000);
  const profile = useDoc(stores.profile).value;
  const sleep = useSleep();
  const feedings = useFeedings();
  const diapers = useDiapers();
  const saved = useSaved();
  const experts = useCatalog(stores.experts);
  const baby = profile?.baby;
  const babyName = baby?.name ?? 'your baby';

  const recent = [
    ...sleep.completed.slice(0, 3).map((s) => ({ id: s.id, at: s.endedAt!, icon: 'moon' as IconName, title: `Slept ${formatDuration(durationOf(s))}`, href: '/nursery/sleep' as const })),
    ...feedings.items.slice(0, 3).map((f) => ({ id: f.id, at: f.at, icon: (f.kind === 'solid' ? 'bowl' : 'bottle') as IconName, title: [feedingTitle(f), feedingDetail(f)].filter(Boolean).join(' · '), href: '/kitchen/feeding' as const })),
    ...diapers.items.slice(0, 2).map((d) => ({ id: d.id, at: d.at, icon: 'diaper' as IconName, title: `Diaper · ${diaperLabel[d.kind]}`, href: '/changing' as const })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4);

  const ready = sleep.status === 'ready' && feedings.status === 'ready' && diapers.status === 'ready';

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: space.xxl, paddingHorizontal: space.lg - 4, gap: space.lg }}>
      <View style={{ gap: space.md }}>
        <T variant="hero" accessibilityRole="header">
          {greeting(new Date(now))}
          {profile ? `, ${profile.parent.name}` : ''}
        </T>
        <View style={styles.baby}>
          <BabyAvatar size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="heading">{babyName}</T>
            <T variant="small">{baby ? babyAge(baby.birthDate, now) : ' '}</T>
          </View>
          <DemoBadge label="Sample profile" />
        </View>
      </View>

      {sleep.active ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sleep session in progress for ${formatDuration(now - new Date(sleep.active.startedAt).getTime())}. Open the nursery`}
          onPress={() => router.push('/nursery')}
          style={[styles.live, shadow.soft]}>
          <Icon name="moon" color={colors.lampGlow} />
          <View style={{ flex: 1 }}>
            <T variant="smallStrong" style={{ color: colors.warmWhite }}>
              Sleep session in progress
            </T>
            <T variant="small" style={{ color: 'rgba(245,240,231,0.8)' }}>
              Started {formatClock(sleep.active.startedAt)} · {formatDuration(now - new Date(sleep.active.startedAt).getTime())} so far
            </T>
          </View>
          <Icon name="chevron" color={colors.warmWhite} />
        </Pressable>
      ) : null}

      <Section title="Today so far">
        <T variant="lead" accessibilityLiveRegion="polite">
          {ready ? todaySentence(babyName, sleep.today.length, sleep.todayTotalMs, feedings.milkToday.length, feedings.milkToday[0]?.at, diapers.today.length) : 'Gathering today’s notes…'}
        </T>
        <T variant="caption">Every day looks different. These are just your notes, not a score.</T>
      </Section>

      <Panel tone="sage" style={{ padding: space.lg - 4, gap: space.sm }}>
        <T variant="title">Need a hand?</T>
        <T style={{ color: colors.ink2 }}>Ask a question in your own words and we’ll point you toward people who can help.</T>
        <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
          <Button label="Ask a question" icon="support" variant="sage" onPress={() => router.push('/support/ask')} style={{ flexGrow: 1 }} />
          <Button label="Find an expert" variant="secondary" onPress={() => router.push('/support/experts')} style={{ flexGrow: 1 }} />
        </View>
      </Panel>

      <Section title="Step into a room" action={{ label: 'All rooms', onPress: () => router.push('/rooms') }}>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <RoomTile room={ROOMS.nursery} note={sleep.active ? 'Session running' : 'Sleep & comfort'} />
          <RoomTile room={ROOMS.kitchen} note="Feeding & nutrition" />
        </View>
      </Section>

      <Section title="Recent activity">
        {recent.length ? (
          recent.map((r, i) => (
            <ListRow key={r.id} icon={r.icon} title={r.title} meta={relativeTime(r.at, now)} onPress={() => router.push(r.href)} last={i === recent.length - 1} />
          ))
        ) : (
          <T variant="small">{ready ? 'Nothing logged yet. Notes you add in the rooms will show up here.' : ' '}</T>
        )}
      </Section>

      <Section title="Saved for later" action={saved.items.length ? { label: 'See all', onPress: () => router.push('/profile/saved') } : undefined}>
        {saved.items.length ? (
          saved.items.slice(0, 2).map((s, i, arr) => (
            <ListRow key={s.id} icon="bookmark" title={s.title} subtitle={`Saved ${relativeTime(s.savedAt, now)}`} onPress={() => router.push('/profile/saved')} last={i === arr.length - 1} />
          ))
        ) : (
          <T variant="small">Bookmark products, answers and activities to find them here.</T>
        )}
      </Section>

      <Section title="Support for">
        <View style={styles.chips}>
          {(['sleep', 'feeding', 'soothing', 'development', 'recovery'] as SupportTopic[]).map((t) => (
            <Chip key={t} label={topicLabel[t]} onPress={() => router.push({ pathname: '/support/experts', params: { topic: t } })} />
          ))}
        </View>
        {experts.items.slice(0, 2).map((e) => (
          <ExpertCard key={e.id} expert={e} compact onPress={() => router.push({ pathname: '/support/expert/[id]', params: { id: e.id } })} />
        ))}
        <T variant="caption">Expert profiles in this demo are fictional samples, not real people.</T>
      </Section>
    </ScrollView>
  );
}

function todaySentence(name: string, sleeps: number, sleepMs: number, feeds: number, lastFeedAt: string | undefined, diapers: number) {
  const parts: string[] = [];
  parts.push(sleeps ? `${name} has ${sleeps} sleep${sleeps === 1 ? '' : 's'} logged, about ${formatDuration(sleepMs)} in all.` : `No sleep logged yet today.`);
  parts.push(feeds ? `${feeds} milk feed${feeds === 1 ? '' : 's'}, the latest at ${formatClock(lastFeedAt!)}.` : 'No feeds logged yet.');
  parts.push(diapers ? `${diapers} diaper change${diapers === 1 ? '' : 's'}.` : '');
  return parts.filter(Boolean).join(' ');
}

function RoomTile({ room, note }: { room: RoomInfo; note: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Enter the ${room.name}: ${note}`}
      onPress={() => {
        haptic.soft();
        router.push(room.href);
      }}
      style={({ pressed }) => [styles.tile, shadow.soft, pressed && { transform: [{ scale: 0.985 }] }]}>
      <RoomThumb art={room.art} crop={room.crop} height={128} />
      <View style={styles.tileText}>
        <T style={styles.tileName}>{room.name}</T>
        <T variant="caption">{note}</T>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  baby: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.night,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  tile: { flex: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.warmWhite },
  tileText: { padding: space.sm, gap: 1 },
  tileName: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.charcoal },
});

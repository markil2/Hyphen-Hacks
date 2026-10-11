import { router } from 'expo-router';
import { useEffect } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { BEZEL, BEZEL_EDGE, Grille, LcdPanel, Scanlines, screen } from '@/components/scene/Console';
import { RoomThumb } from '@/components/scene/RoomThumb';
import { T } from '@/components/ui';
import { PAGES, ROOM_ORDER, RoomId, usePager } from '@/features/navigation/PagerContext';
import { BabyAvatar } from '@/features/profile/BabyAvatar';
import { ROOMS } from '@/features/rooms/rooms';
import { hm } from '@/features/sleep/sleepStats';
import { useSleep } from '@/features/sleep/useSleep';
import { haptic } from '@/lib/haptics';
import { babyAge, formatClock, formatElapsed, greeting, relativeTime, useNow } from '@/lib/time';
import { stores, useDoc } from '@/state';
import { colors, fonts, space } from '@/theme';
import type { TimelineEvent, WindowStats } from '@/types';

const eventRoom: Partial<Record<TimelineEvent['type'], RoomId>> = { sleep: 'nursery', feeding: 'kitchen', diaper: 'changing', height: 'play', milestone: 'play', question: 'living', health: 'kitchen' };

/** Home sits above the rooms and works like the monitor's main screen: status, cameras, event log. */
export function HomePage() {
  const insets = useSafeAreaInsets();
  const pager = usePager();
  const sleep = useSleep();
  const now = useNow(sleep.active ? 1000 : 30_000);
  const baby = useDoc(stores.baby);
  const summary = useDoc(stores.babySummary);
  const stats = useDoc(stores.stats);
  const timeline = useDoc(stores.timeline);

  // Refresh whenever Home comes into view.
  useEffect(() => {
    if (pager.page === PAGES.home) {
      summary.retry();
      stats.retry();
      timeline.retry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pager.page]);

  // Dragging past the bottom of Home returns to the rooms.
  const onEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height > contentSize.height + 70) pager.goTo('rooms');
  };

  const s = stats.value;

  return (
    <ScrollView
      style={{ backgroundColor: BEZEL }}
      onScrollEndDrag={onEndDrag}
      contentContainerStyle={{ paddingTop: insets.top + space.xs, paddingBottom: insets.bottom + space.lg, paddingHorizontal: 14, gap: 14 }}>
      {/* the device's top edge: brand, clock, grille */}
      <View style={styles.deviceHead}>
        <T style={styles.brand}>nurture · home</T>
        <Grille slots={7} />
        <T style={styles.brand}>{formatClock(now)}</T>
      </View>
      <T variant="hero" accessibilityRole="header" style={{ paddingHorizontal: 4 }}>
        {greeting(new Date(now))}
      </T>

      {/* Status: the baby, a short summary, and the last 24 hours against the day before */}
      <LcdPanel>
        <View style={styles.babyRow}>
          <BabyAvatar size={48} />
          <View style={{ flex: 1 }}>
            <View style={styles.led}>
              <View style={[styles.ledDot, { backgroundColor: sleep.active ? screen.amber : screen.green }]} />
              <T style={styles.ledText}>
                {sleep.active ? `Sleeping · ${formatElapsed(now - new Date(sleep.active.startedAt).getTime())}` : 'Awake'}
              </T>
            </View>
            <T style={styles.name} numberOfLines={1}>
              {baby.value?.name ?? ' '}
            </T>
            <T style={styles.muted}>{baby.value ? babyAge(baby.value.birthDate, now) : ' '}</T>
          </View>
        </View>
        <T style={styles.summary} accessibilityLiveRegion="polite">
          {summary.value ? `✦ ${summary.value.summary}` : summary.status === 'error' ? 'Summary unavailable right now.' : 'Reading the logs…'}
        </T>
        <View style={styles.statRow}>
          <Delta label="Sleep · 24h" value={s ? hm(s.last24h.sleepMinutes) : '…'} delta={s ? change(s.last24h, s.previous24h, 'sleepMinutes') : ''} />
          <Delta label="Feeds · 24h" value={s ? String(s.last24h.feeds) : '…'} delta={s ? change(s.last24h, s.previous24h, 'feeds') : ''} />
          <Delta label="Changes · 24h" value={s ? String(s.last24h.diapers) : '…'} delta={s ? change(s.last24h, s.previous24h, 'diapers') : ''} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Full statistics"
          onPress={() => {
            haptic.tap();
            router.push('/stats');
          }}
          hitSlop={10}
          style={({ pressed }) => [styles.statsLink, pressed && { opacity: 0.6 }]}>
          <T style={styles.statsLinkText}>Full stats</T>
          <Icon name="chevron" size={12} color={screen.muted} />
        </Pressable>
      </LcdPanel>

      {/* Cameras: every room as a feed */}
      <View style={styles.cams}>
        {ROOM_ORDER.map((id, i) => (
          <CamTile key={id} id={id} index={i} note={id === 'nursery' && sleep.active ? 'Sleeping' : undefined} onPress={() => pager.goToRoom(id)} />
        ))}
        <SupportTile />
      </View>

      {/* Event log */}
      <LcdPanel title="Event log">
        {timeline.value?.length ? (
          timeline.value.slice(0, 6).map((e, i) => (
            <Pressable
              key={`${e.type}-${e.at}-${i}`}
              accessibilityRole={eventRoom[e.type] ? 'button' : undefined}
              disabled={!eventRoom[e.type]}
              onPress={() => eventRoom[e.type] && pager.goToRoom(eventRoom[e.type]!)}
              style={({ pressed }) => [styles.event, pressed && { opacity: 0.7 }]}>
              <T style={styles.eventTime}>{formatClock(e.at)}</T>
              <T style={styles.eventText} numberOfLines={1}>
                {e.title}
              </T>
              <T style={styles.eventAgo}>{relativeTime(e.at, now)}</T>
            </Pressable>
          ))
        ) : (
          <T style={styles.muted}>{timeline.status === 'error' ? 'Couldn’t load the log.' : timeline.status === 'ready' ? 'Nothing logged yet. What you log in the rooms shows up here.' : 'Loading…'}</T>
        )}
      </LcdPanel>

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

/** "▲ 40m" / "▼ 2" / "same" against the previous 24 hours. Direction only; never good or bad. */
function change(now: WindowStats, before: WindowStats, key: keyof WindowStats) {
  const d = now[key] - before[key];
  if (!now[key] && !before[key]) return '—';
  if (d === 0) return 'same as day before';
  const amount = key === 'sleepMinutes' ? hm(Math.abs(d)) : String(Math.abs(d));
  return `${d > 0 ? '▲' : '▼'} ${amount} vs day before`;
}

function Delta({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <View style={styles.delta} accessible accessibilityLabel={`${label}: ${value}. ${delta}`}>
      <T style={styles.deltaLabel}>{label}</T>
      <T style={styles.deltaValue}>{value}</T>
      <T style={styles.deltaChange} numberOfLines={2}>
        {delta}
      </T>
    </View>
  );
}

function CamTile({ id, index, note, onPress }: { id: RoomId; index: number; note?: string; onPress: () => void }) {
  const room = ROOMS[id];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Go to the ${room.name}`}
      onPress={() => {
        haptic.soft();
        onPress();
      }}
      style={({ pressed }) => [styles.cam, pressed && { transform: [{ scale: 0.98 }] }]}>
      <RoomThumb art={room.art} crop={room.crop} height={96} />
      <Scanlines opacity={0.14} />
      <View style={styles.camOsd} pointerEvents="none">
        <View style={styles.led}>
          <View style={[styles.ledDot, { backgroundColor: screen.green }]} />
          <T style={styles.camText}>CAM {index + 1}</T>
        </View>
        <T style={styles.camText}>{note ?? room.name}</T>
      </View>
    </Pressable>
  );
}

function SupportTile() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ask a question"
      onPress={() => {
        haptic.soft();
        router.push('/support/ask');
      }}
      style={({ pressed }) => [styles.cam, styles.support, pressed && { transform: [{ scale: 0.98 }] }]}>
      <T style={styles.camText}>Need a hand?</T>
      <View style={styles.askKey}>
        <Icon name="support" size={16} color="#2A211A" />
        <T style={styles.askText}>Ask</T>
      </View>
      <Scanlines opacity={0.12} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deviceHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingTop: 4 },
  brand: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 2, color: '#8F8371', textTransform: 'uppercase' },
  babyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  led: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ledDot: { width: 7, height: 7, borderRadius: 4 },
  ledText: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  name: { fontFamily: fonts.lcd, fontSize: 26, lineHeight: 30, color: screen.amber, textShadowColor: 'rgba(242,201,138,0.5)', textShadowRadius: 8 },
  muted: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
  summary: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: screen.ink },
  statRow: { flexDirection: 'row', gap: 6 },
  delta: { flex: 1, backgroundColor: screen.card, borderRadius: 8, padding: 8, gap: 1, borderWidth: 1, borderColor: 'rgba(242,201,138,0.08)' },
  deltaLabel: { fontFamily: fonts.lcd, fontSize: 10.5, letterSpacing: 0.8, color: screen.muted, textTransform: 'uppercase' },
  deltaValue: { fontFamily: fonts.lcd, fontSize: 20, color: screen.amber },
  deltaChange: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, color: screen.muted },
  statsLink: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-end', minHeight: 24 },
  statsLinkText: { fontFamily: fonts.lcd, fontSize: 11.5, letterSpacing: 1, color: screen.muted, textTransform: 'uppercase' },
  cams: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cam: { width: '48.4%', height: 96, borderRadius: 12, overflow: 'hidden', borderWidth: 4, borderColor: '#14110E', backgroundColor: screen.bg },
  camOsd: { position: 'absolute', left: 8, right: 8, top: 6, bottom: 6, justifyContent: 'space-between' },
  camText: { fontFamily: fonts.lcd, fontSize: 11, letterSpacing: 1, color: screen.ink, textTransform: 'uppercase', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 },
  support: { padding: 10, justifyContent: 'space-between' },
  askKey: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 8, backgroundColor: screen.amber },
  askText: { fontFamily: fonts.lcd, fontSize: 15, letterSpacing: 1, color: '#2A211A', textTransform: 'uppercase' },
  event: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  eventTime: { fontFamily: fonts.lcd, fontSize: 13, color: screen.amber, width: 66 },
  eventText: { flex: 1, fontFamily: fonts.body, fontSize: 13.5, color: screen.ink },
  eventAgo: { fontFamily: fonts.lcd, fontSize: 11, color: screen.muted },
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48, borderTopWidth: 1, borderTopColor: BEZEL_EDGE },
  backText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink2 },
});

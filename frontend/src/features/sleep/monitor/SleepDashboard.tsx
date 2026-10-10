import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { formatClock, formatElapsed, useNow } from '@/lib/time';
import { fonts } from '@/theme';
import type { SleepSession } from '@/types';

import { hm, sleepStats } from '../sleepStats';

export const screen = {
  bg: '#1B1815',
  card: '#26221E',
  line: 'rgba(243,236,224,0.08)',
  ink: '#F3ECE0',
  muted: '#A99E90',
  amber: '#F2C98A',
};

/**
 * The monitor's second screen. Everything here comes from logged sessions.
 * Vitals tiles are deliberately empty: there is no sensor, so there is no number.
 */
export function SleepDashboard({
  sessions,
  active,
  busy,
  error,
  onToggleLamp,
  loading,
}: {
  sessions: SleepSession[];
  active: SleepSession | null;
  busy: boolean;
  error: string | null;
  onToggleLamp: () => void;
  loading: boolean;
}) {
  const now = useNow(1000, Boolean(active));
  const stats = sleepStats(sessions, now);
  const maxBar = Math.max(60, ...stats.week.map((d) => d.minutes));

  return (
    <View style={styles.wrap}>
      {/* Current session */}
      <View style={[styles.card, styles.hero]} accessibilityLiveRegion="polite">
        <Icon name="moon" size={30} color={screen.amber} fill={active ? screen.amber : 'none'} />
        <View style={{ flex: 1 }}>
          <T style={styles.label}>{active ? 'Current sleep session' : 'No session running'}</T>
          {active ? (
            <>
              <T style={styles.big}>{formatElapsed(now - new Date(active.startedAt).getTime())}</T>
              <T style={styles.muted}>since {formatClock(active.startedAt)}</T>
            </>
          ) : (
            <>
              <T style={styles.bigQuiet}>{stats.lastWokeAt ? `Up since ${formatClock(stats.lastWokeAt)}` : '—'}</T>
              <T style={styles.muted}>Pull the lamp chain or use Lamp below to log sleep.</T>
            </>
          )}
        </View>
      </View>

      {/* Vitals: no sensors, so honest placeholders */}
      <View style={styles.grid}>
        {(
          [
            ['heart', 'Heart rate'],
            ['sparkle', 'Breathing'],
            ['lamp', 'Room temp'],
            ['support', 'Noise level'],
          ] as [IconName, string][]
        ).map(([icon, label]) => (
          <View key={label} style={[styles.card, styles.tile]} accessible accessibilityLabel={`${label}: no sensor connected`}>
            <Icon name={icon} size={16} color={screen.muted} />
            <T style={styles.tileLabel}>{label}</T>
            <T style={styles.tileValue}>—</T>
            <T style={styles.tileNote}>No sensor connected</T>
          </View>
        ))}
      </View>

      {/* Today */}
      <View style={styles.card}>
        <T style={styles.section}>Today</T>
        <View style={styles.statsRow}>
          <Stat value={loading ? '…' : hm(stats.todayMinutes)} label="asleep" />
          <Stat value={loading ? '…' : String(stats.todayCount)} label={stats.todayCount === 1 ? 'sleep' : 'sleeps'} />
          <Stat value={loading ? '…' : hm(stats.longestTodayMinutes)} label="longest" />
        </View>
      </View>

      {/* Last 7 days */}
      <View style={styles.card}>
        <View style={styles.sectionRow}>
          <T style={styles.section}>Last 7 days</T>
          <T style={styles.muted}>{stats.weekAverageMinutes ? `avg ${hm(stats.weekAverageMinutes)} on logged days` : 'Nothing logged yet'}</T>
        </View>
        <View style={styles.bars} accessible accessibilityLabel={stats.week.map((d) => `${d.label}: ${hm(d.minutes)}`).join(', ')}>
          {stats.week.map((d) => (
            <View key={d.dayStart} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${Math.max(d.minutes ? 6 : 0, (d.minutes / maxBar) * 100)}%` }, d.label === 'Today' && styles.barToday]} />
              </View>
              <T style={styles.barLabel}>{d.label === 'Today' ? 'Now' : d.label.slice(0, 2)}</T>
            </View>
          ))}
        </View>
      </View>

      {/* This sleep */}
      {active ? (
        <View style={styles.card}>
          <T style={styles.section}>During this sleep</T>
          <View style={styles.event}>
            <View style={styles.eventDot} />
            <T style={styles.eventTime}>{formatClock(active.startedAt)}</T>
            <T style={styles.eventText}>Session started</T>
          </View>
          {active.notes ? (
            <View style={styles.event}>
              <View style={[styles.eventDot, { backgroundColor: screen.muted }]} />
              <T style={styles.eventTime}> </T>
              <T style={styles.eventText}>{active.notes}</T>
            </View>
          ) : null}
          <T style={styles.tileNote}>Only what you log appears here. Nurture can’t sense sleep stages.</T>
        </View>
      ) : null}

      {/* Controls */}
      <View style={styles.card}>
        <T style={styles.section}>Controls</T>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Lamp"
          accessibilityState={{ checked: !active, busy }}
          accessibilityHint={active ? 'Turns the lamp on and ends the sleep session' : 'Dims the lamp and starts a sleep session'}
          disabled={busy}
          onPress={() => {
            haptic.soft();
            onToggleLamp();
          }}
          style={({ pressed }) => [styles.control, pressed && { opacity: 0.75 }, busy && { opacity: 0.5 }]}>
          <Icon name="lamp" size={22} color={active ? screen.muted : screen.amber} />
          <View>
            <T style={styles.controlLabel}>Lamp</T>
            <T style={[styles.controlState, { color: active ? screen.muted : screen.amber }]}>{active ? 'Off · sleeping' : 'On'}</T>
          </View>
        </Pressable>
        {error ? (
          <T style={styles.error} accessibilityRole="alert">
            {error}
          </T>
        ) : null}
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <T style={styles.statValue}>{value}</T>
      <T style={styles.muted}>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  card: { backgroundColor: screen.card, borderRadius: 14, padding: 12, gap: 8 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: screen.muted },
  big: { fontFamily: fonts.bodySemibold, fontSize: 30, lineHeight: 36, color: screen.ink, fontVariant: ['tabular-nums'] },
  bigQuiet: { fontFamily: fonts.bodySemibold, fontSize: 20, lineHeight: 26, color: screen.ink },
  muted: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: screen.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '48.6%', gap: 2 },
  tileLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: screen.ink },
  tileValue: { fontFamily: fonts.bodySemibold, fontSize: 18, color: screen.muted },
  tileNote: { fontFamily: fonts.body, fontSize: 11, color: screen.muted, opacity: 0.85 },
  section: { fontFamily: fonts.bodySemibold, fontSize: 13, color: screen.ink },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statValue: { fontFamily: fonts.bodySemibold, fontSize: 18, color: screen.ink, fontVariant: ['tabular-nums'] },
  bars: { flexDirection: 'row', gap: 6, height: 92, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 6, backgroundColor: 'rgba(243,236,224,0.05)', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 6, backgroundColor: 'rgba(242,201,138,0.45)' },
  barToday: { backgroundColor: screen.amber },
  barLabel: { fontFamily: fonts.bodyMedium, fontSize: 10.5, color: screen.muted },
  event: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eventDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: screen.amber },
  eventTime: { fontFamily: fonts.bodyMedium, fontSize: 12, color: screen.amber, width: 62, fontVariant: ['tabular-nums'] },
  eventText: { fontFamily: fonts.body, fontSize: 13, color: screen.ink, flex: 1 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(243,236,224,0.06)',
    borderWidth: 1,
    borderColor: screen.line,
  },
  controlLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: screen.ink },
  controlState: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  error: { fontFamily: fonts.body, fontSize: 12.5, color: '#F0B4A4' },
});

import { StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { screen } from '@/components/scene/Console';
import { T } from '@/components/ui';
import { formatClock, formatDuration, formatElapsed, useNow } from '@/lib/time';
import { fonts } from '@/theme';
import type { SleepSession } from '@/types';

import { hm, sleepStats } from '../sleepStats';

export { screen };

/** Minutes for display: a logged nap shorter than a minute still shows as something. */
const mins = (m: number, any: boolean) => (any && m < 1 ? '<1m' : hm(m));

/**
 * The monitor's second screen, sized to sit under the camera without scrolling.
 * Everything here comes from logged sessions; the lamp in the room is the only
 * sleep switch. Vitals tiles stay empty: there is no sensor, so there is no number.
 */
export function SleepDashboard({
  sessions,
  active,
  error,
  loading,
}: {
  sessions: SleepSession[];
  active: SleepSession | null;
  error: string | null;
  loading: boolean;
}) {
  const now = useNow(1000, Boolean(active));
  const stats = sleepStats(sessions, now);
  const maxBar = Math.max(60, ...stats.week.map((d) => d.minutes));
  const any = stats.todayCount > 0;

  return (
    <View style={styles.wrap}>
      {/* Current session */}
      <View style={[styles.card, styles.hero]} accessibilityLiveRegion="polite">
        <Icon name="moon" size={26} color={screen.amber} fill={active ? screen.amber : 'none'} />
        <View style={{ flex: 1 }}>
          <T style={styles.label}>{active ? `Asleep since ${formatClock(active.startedAt)}` : 'Awake'}</T>
          <T style={styles.big}>
            {active
              ? formatElapsed(now - new Date(active.startedAt).getTime())
              : stats.lastWokeAt
                ? `Up ${formatDuration(now - new Date(stats.lastWokeAt).getTime()).replace('under a minute', 'just now')}`
                : 'No sleep logged'}
          </T>
          {error ? (
            <T style={styles.error} accessibilityRole="alert">
              {error}
            </T>
          ) : (
            <T style={styles.muted} numberOfLines={1}>
              {active?.notes ? active.notes : active ? 'Pull the lamp chain to end the session.' : 'Pull the lamp chain to start a session.'}
            </T>
          )}
        </View>
      </View>

      {/* Today + last 7 days */}
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <Stat value={loading ? '…' : mins(stats.todayMinutes, any)} label="asleep today" />
          <Stat value={loading ? '…' : String(stats.todayCount)} label={stats.todayCount === 1 ? 'sleep' : 'sleeps'} />
          <Stat value={loading ? '…' : mins(stats.longestTodayMinutes, any)} label="longest" />
        </View>
        <View style={styles.bars} accessible accessibilityLabel={`Last 7 days: ${stats.week.map((d) => `${d.label} ${hm(d.minutes)}`).join(', ')}`}>
          {stats.week.map((d) => (
            <View key={d.dayStart} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: `${Math.max(d.minutes ? 6 : 0, (d.minutes / maxBar) * 100)}%` }, d.label === 'Today' && styles.barToday]} />
              </View>
              <T style={styles.barLabel}>{d.label === 'Today' ? 'Now' : d.label.slice(0, 2)}</T>
            </View>
          ))}
        </View>
        <T style={styles.muted}>{stats.weekAverageMinutes ? `Last 7 days · avg ${hm(stats.weekAverageMinutes)} on logged days` : 'Last 7 days · nothing logged yet'}</T>
      </View>

      {/* Vitals: no sensors, so honest placeholders */}
      <View style={styles.vitals}>
        {(
          [
            ['heart', 'Heart'],
            ['sparkle', 'Breath'],
            ['lamp', 'Temp'],
            ['support', 'Noise'],
          ] as [IconName, string][]
        ).map(([icon, label]) => (
          <View key={label} style={[styles.card, styles.tile]} accessible accessibilityLabel={`${label}: no sensor connected`}>
            <Icon name={icon} size={14} color={screen.muted} />
            <T style={styles.tileLabel}>{label}</T>
            <T style={styles.tileValue}>—</T>
          </View>
        ))}
      </View>
      <T style={styles.note}>No sensors connected · only what you log appears here</T>
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
  card: { backgroundColor: screen.card, borderRadius: 8, padding: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(242,201,138,0.08)' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { fontFamily: fonts.lcd, fontSize: 12.5, letterSpacing: 1, color: screen.muted, textTransform: 'uppercase' },
  big: { fontFamily: fonts.lcd, fontSize: 30, lineHeight: 34, color: screen.amber, textShadowColor: 'rgba(242,201,138,0.55)', textShadowRadius: 8 },
  muted: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: screen.muted },
  error: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16, color: screen.red },
  statsRow: { flexDirection: 'row', gap: 8 },
  statValue: { fontFamily: fonts.lcd, fontSize: 21, color: screen.amber, textShadowColor: 'rgba(242,201,138,0.45)', textShadowRadius: 6 },
  bars: { flexDirection: 'row', gap: 6, height: 64, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', gap: 3, height: '100%' },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 5, backgroundColor: 'rgba(243,236,224,0.05)', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 5, backgroundColor: 'rgba(242,201,138,0.45)' },
  barToday: { backgroundColor: screen.amber },
  barLabel: { fontFamily: fonts.lcd, fontSize: 10.5, color: screen.muted },
  vitals: { flexDirection: 'row', gap: 6 },
  tile: { flex: 1, padding: 8, gap: 1, alignItems: 'center' },
  tileLabel: { fontFamily: fonts.bodyMedium, fontSize: 11, color: screen.ink },
  tileValue: { fontFamily: fonts.lcd, fontSize: 16, color: screen.muted },
  note: { fontFamily: fonts.body, fontSize: 11, color: screen.muted, opacity: 0.85, textAlign: 'center' },
});

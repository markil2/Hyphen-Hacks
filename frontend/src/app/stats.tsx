import { StyleSheet, View } from 'react-native';

import { LcdPanel, screen } from '@/components/scene/Console';
import { MonitorScreen } from '@/components/scene/MonitorScreen';
import { T } from '@/components/ui';
import { hm } from '@/features/sleep/sleepStats';
import { stores, useDoc } from '@/state';
import { fonts } from '@/theme';
import type { DayStats } from '@/types';

/** The last two weeks at a glance: what was logged each day. Counts only — nothing is scored. */
export default function Stats() {
  const stats = useDoc(stores.stats);
  const d = stats.value?.daily ?? [];
  const week = d.slice(-7);
  const prev = d.slice(-14, -7);
  const avg = (list: DayStats[], k: keyof Omit<DayStats, 'date'>) => (list.length ? list.reduce((s, x) => s + x[k], 0) / list.length : 0);
  const heights = stats.value?.heights ?? [];
  const weights = stats.value?.weights ?? [];

  return (
    <MonitorScreen title="Statistics" subtitle="Last 14 days, from what you’ve logged">
      {stats.status === 'error' ? <T style={styles.muted}>Couldn’t load statistics.</T> : null}
      <Chart title="Sleep" days={d} pick={(x) => x.sleepMinutes} format={(m) => hm(m)} avg={`7-day avg ${hm(avg(week, 'sleepMinutes'))} · before ${hm(avg(prev, 'sleepMinutes'))}`} />
      <Chart title="Feeds" days={d} pick={(x) => x.feeds} format={String} avg={`7-day avg ${avg(week, 'feeds').toFixed(1)} · before ${avg(prev, 'feeds').toFixed(1)} · ${week.reduce((s, x) => s + x.solids, 0)} solids this week`} />
      <Chart title="Diaper changes" days={d} pick={(x) => x.diapers} format={String} avg={`7-day avg ${avg(week, 'diapers').toFixed(1)} · before ${avg(prev, 'diapers').toFixed(1)}`} />
      <LcdPanel title="Height">
        {heights.length ? (
          heights.slice(-5).map((h) => (
            <View key={h.measuredAt} style={styles.row}>
              <T style={styles.rowDate}>{new Date(h.measuredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</T>
              <T style={styles.rowValue}>
                {h.height} {h.unit}
              </T>
            </View>
          ))
        ) : (
          <T style={styles.muted}>No measurements yet. Add one on the growth board in the play corner.</T>
        )}
      </LcdPanel>
      <LcdPanel title="Weight">
        {weights.length ? (
          weights.slice(-5).map((w) => (
            <View key={w.measuredAt} style={styles.row}>
              <T style={styles.rowDate}>{new Date(w.measuredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</T>
              <T style={styles.rowValue}>
                {w.weight} {w.unit}
              </T>
            </View>
          ))
        ) : (
          <T style={styles.muted}>No weights yet. Use the baby scale in the play corner.</T>
        )}
      </LcdPanel>
      <T style={styles.note}>These are your own logs, not a score. Every baby’s days look different.</T>
    </MonitorScreen>
  );
}

function Chart({ title, days, pick, format, avg }: { title: string; days: DayStats[]; pick: (d: DayStats) => number; format: (n: number) => string; avg: string }) {
  const max = Math.max(1, ...days.map(pick));
  const today = days.at(-1);
  return (
    <LcdPanel title={title} right={<T style={styles.today}>{today ? `Today ${format(pick(today))}` : ''}</T>}>
      <View style={styles.bars} accessible accessibilityLabel={`${title}, last ${days.length} days: ${days.map((x) => format(pick(x))).join(', ')}`}>
        {days.map((x, i) => (
          <View key={x.date} style={styles.col}>
            <View style={styles.track}>
              <View style={[styles.bar, { height: `${Math.max(pick(x) ? 5 : 0, (pick(x) / max) * 100)}%` }, i === days.length - 1 && styles.barToday]} />
            </View>
            <T style={styles.dayLabel}>{i % 2 === days.length % 2 ? new Date(x.date).toLocaleDateString(undefined, { weekday: 'narrow' }) : ' '}</T>
          </View>
        ))}
      </View>
      <T style={styles.muted}>{avg}</T>
    </LcdPanel>
  );
}

const styles = StyleSheet.create({
  muted: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
  note: { fontFamily: fonts.body, fontSize: 12, color: screen.muted, textAlign: 'center' },
  today: { fontFamily: fonts.lcd, fontSize: 13, color: screen.amber },
  bars: { flexDirection: 'row', gap: 4, height: 84, alignItems: 'flex-end' },
  col: { flex: 1, height: '100%', alignItems: 'center', gap: 3 },
  track: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 3, backgroundColor: 'rgba(243,236,224,0.05)', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 3, backgroundColor: 'rgba(242,201,138,0.45)' },
  barToday: { backgroundColor: screen.amber },
  dayLabel: { fontFamily: fonts.lcd, fontSize: 10, color: screen.muted },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowDate: { fontFamily: fonts.lcd, fontSize: 13, color: screen.muted },
  rowValue: { fontFamily: fonts.lcd, fontSize: 15, color: screen.amber },
});

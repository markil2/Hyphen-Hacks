import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { goBack, T } from '@/components/ui';
import { screen } from '@/features/sleep/monitor/SleepDashboard';
import { hm, sleepStats } from '@/features/sleep/sleepStats';
import { durationOf, useSleep } from '@/features/sleep/useSleep';
import { haptic } from '@/lib/haptics';
import { dayLabel, formatClock } from '@/lib/time';
import { fonts } from '@/theme';
import type { SleepSession } from '@/types';

/** Past sleep sessions, on the monitor's digital screen. Tap one to correct it. */
export default function SleepSessions() {
  const insets = useSafeAreaInsets();
  const sleep = useSleep();
  const stats = sleepStats(sleep.items);
  const groups = new Map<string, SleepSession[]>();
  for (const s of sleep.completed) groups.set(dayLabel(s.startedAt), [...(groups.get(dayLabel(s.startedAt)) ?? []), s]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to the monitor" onPress={() => goBack('/')} style={styles.back} hitSlop={8}>
          <Icon name="back" color={screen.ink} />
        </Pressable>
        <View>
          <T style={styles.title} accessibilityRole="header">
            Sleep sessions
          </T>
          <T style={styles.sub}>
            {sleep.completed.length} logged · avg {hm(stats.weekAverageMinutes)} a day this week
          </T>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 18 }}>
        {sleep.status === 'error' ? (
          <View style={styles.card} accessibilityRole="alert">
            <T style={styles.rowTitle}>Couldn’t load sessions</T>
            <T style={styles.sub}>{sleep.error}</T>
            <Pressable accessibilityRole="button" onPress={sleep.retry} style={styles.retry}>
              <T style={styles.retryText}>Try again</T>
            </Pressable>
          </View>
        ) : sleep.status !== 'ready' && !sleep.items.length ? (
          <ActivityIndicator color={screen.amber} accessibilityLabel="Loading sessions" />
        ) : !sleep.completed.length ? (
          <View style={styles.card}>
            <T style={styles.rowTitle}>No finished sessions yet</T>
            <T style={styles.sub}>Pull the lamp chain when sleep starts, and again when it ends.</T>
          </View>
        ) : (
          [...groups.entries()].map(([day, list]) => (
            <View key={day} style={{ gap: 8 }}>
              <View style={styles.dayRow}>
                <T style={styles.day}>{day}</T>
                <T style={styles.sub}>{hm(list.reduce((sum, s) => sum + durationOf(s) / 60000, 0))}</T>
              </View>
              <View style={styles.card}>
                {list.map((s, i) => (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Sleep from ${formatClock(s.startedAt)} to ${formatClock(s.endedAt!)}, ${hm(durationOf(s) / 60000)}. Edit`}
                    onPress={() => {
                      haptic.tap();
                      router.push({ pathname: '/nursery/edit', params: { id: s.id } });
                    }}
                    style={({ pressed }) => [styles.row, i < list.length - 1 && styles.rowLine, pressed && { opacity: 0.7 }]}>
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                      <T style={styles.rowTitle}>
                        {formatClock(s.startedAt)} – {formatClock(s.endedAt!)}
                      </T>
                      {s.notes ? <T style={styles.sub}>{s.notes}</T> : null}
                    </View>
                    <T style={styles.duration}>{hm(durationOf(s) / 60000)}</T>
                    <Icon name="chevron" size={16} color={screen.muted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: screen.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: screen.line },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: screen.card },
  title: { fontFamily: fonts.display, fontSize: 24, color: screen.ink },
  sub: { fontFamily: fonts.body, fontSize: 12.5, color: screen.muted },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  day: { fontFamily: fonts.bodySemibold, fontSize: 13, color: screen.amber, letterSpacing: 0.3 },
  card: { backgroundColor: screen.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, paddingVertical: 8 },
  rowLine: { borderBottomWidth: 1, borderBottomColor: screen.line },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: screen.amber },
  rowTitle: { fontFamily: fonts.bodySemibold, fontSize: 15, color: screen.ink, fontVariant: ['tabular-nums'] },
  duration: { fontFamily: fonts.bodySemibold, fontSize: 14, color: screen.ink, fontVariant: ['tabular-nums'] },
  retry: { alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: 'rgba(243,236,224,0.08)', marginBottom: 10 },
  retryText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: screen.ink },
});

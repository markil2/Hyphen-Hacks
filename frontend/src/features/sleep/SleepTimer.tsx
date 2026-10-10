import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Button, T } from '@/components/ui';
import { formatClock, formatDuration, formatElapsed, useNow } from '@/lib/time';
import { colors, radius, space } from '@/theme';
import type { SleepSession } from '@/types';

import { durationOf } from './useSleep';

/**
 * Current session status with the start/end control.
 * Elapsed time is always `now − startedAt`, so leaving the screen never resets it.
 */
export function SleepTimer({
  active,
  justEnded,
  onStart,
  onEnd,
  onEdit,
  onDismissEnded,
  busy,
  error,
  tone = 'paper',
}: {
  active: SleepSession | null;
  justEnded: SleepSession | null;
  onStart: () => void;
  onEnd: () => void;
  onEdit: (session: SleepSession) => void;
  onDismissEnded: () => void;
  busy: boolean;
  error?: string | null;
  tone?: 'paper' | 'night';
}) {
  const now = useNow(1000, Boolean(active));
  const night = tone === 'night';
  const ink = night ? colors.warmWhite : colors.charcoal;
  const sub = night ? 'rgba(245,240,231,0.78)' : colors.ink2;

  if (active) {
    return (
      <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={styles.block} accessibilityLiveRegion="polite">
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: colors.lampGlow }]} />
          <T variant="smallStrong" style={{ color: ink }}>
            Sleep session in progress
          </T>
        </View>
        <T
          variant="numeral"
          style={{ color: ink }}
          accessibilityLabel={`Elapsed ${formatDuration(now - new Date(active.startedAt).getTime())}`}>
          {formatElapsed(now - new Date(active.startedAt).getTime())}
        </T>
        <View style={styles.startedRow}>
          <T variant="small" style={{ color: sub }}>
            Started {formatClock(active.startedAt)}
          </T>
          <Button label="Adjust start" icon="edit" size="sm" variant="quiet" onPress={() => onEdit(active)} />
        </View>
        <Button label="End session" icon="check" onPress={onEnd} loading={busy} variant={night ? 'secondary' : 'primary'} size="lg" full />
        {error ? <ErrorLine text={error} night={night} /> : null}
      </Animated.View>
    );
  }

  if (justEnded) {
    return (
      <Animated.View entering={FadeIn.duration(220)} style={styles.block} accessibilityLiveRegion="polite">
        <View style={styles.statusRow}>
          <Icon name="check" size={18} color={night ? colors.lampGlow : colors.sageDeep} strokeWidth={2.2} />
          <T variant="smallStrong" style={{ color: ink }}>
            Session saved
          </T>
        </View>
        <T variant="title" style={{ color: ink }}>
          {formatDuration(durationOf(justEnded))}
        </T>
        <T variant="small" style={{ color: sub }}>
          {formatClock(justEnded.startedAt)} – {formatClock(justEnded.endedAt!)}
        </T>
        <View style={styles.actions}>
          <Button label="Fix times" icon="edit" variant="secondary" onPress={() => onEdit(justEnded)} style={{ flex: 1 }} />
          <Button label="Done" variant={night ? 'secondary' : 'primary'} onPress={onDismissEnded} style={{ flex: 1 }} />
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.block}>
      <T variant="smallStrong" style={{ color: ink }}>
        No session running
      </T>
      <T variant="small" style={{ color: sub }}>
        Pull the lamp chain, or use the button, when you’d like to note that sleep has started.
      </T>
      <Button label="Start sleep session" icon="moon" onPress={onStart} loading={busy} variant={night ? 'secondary' : 'primary'} />
      {error ? <ErrorLine text={error} night={night} /> : null}
    </Animated.View>
  );
}

function ErrorLine({ text, night }: { text: string; night: boolean }) {
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Icon name="alert" size={16} color={night ? colors.lampGlow : colors.danger} />
      <T variant="small" style={{ color: night ? colors.warmWhite : colors.danger, flex: 1 }}>
        {text}
      </T>
    </View>
  );
}

/** Shared by the nursery and the sleep screen: tracks the session the parent just ended. */
export function useJustEnded() {
  const [id, setId] = useState<string | null>(null);
  return { justEndedId: id, setJustEndedId: setId };
}

const styles = StyleSheet.create({
  block: { gap: space.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', gap: space.xs, marginTop: space.xs },
  startedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
  error: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    padding: space.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(142,59,46,0.08)',
  },
});

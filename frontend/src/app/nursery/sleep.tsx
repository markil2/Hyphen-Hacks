import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsyncBlock, Button, DemoNotice, EmptyState, goBack, IconButton, Panel, Section, Segmented, T, TextField } from '@/components/ui';
import { CribCloseUp } from '@/features/sleep/CribCloseUp';
import { SleepHistory } from '@/features/sleep/SleepHistory';
import { SleepTimer } from '@/features/sleep/SleepTimer';
import { useSessionFlow } from '@/features/sleep/useSessionFlow';
import { formatDuration } from '@/lib/time';
import { colors, radius, space } from '@/theme';

export default function SleepScreen() {
  const insets = useSafeAreaInsets();
  const flow = useSessionFlow();
  const { sleep } = flow;
  const [range, setRange] = useState<'today' | 'earlier'>('today');
  const earlier = sleep.completed.filter((s) => !sleep.today.includes(s));

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.xxl }} keyboardShouldPersistTaps="handled">
        <View>
          <CribCloseUp dim={Boolean(flow.active)} height={300 + insets.top} />
          <View style={[styles.topBar, { top: insets.top + space.xs }]}>
            <IconButton icon="back" label="Back to the nursery" onPress={() => goBack('/nursery')} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={{ gap: space.xxs }}>
            <T variant="hero" accessibilityRole="header">
              Sleep
            </T>
            <T variant="lead">A simple record of when sleep starts and ends.</T>
          </View>

          <Panel tone="white" style={styles.timerPanel}>
            <SleepTimer
              active={flow.active}
              justEnded={flow.justEnded}
              busy={flow.busy}
              error={flow.error}
              onStart={flow.start}
              onEnd={flow.end}
              onEdit={(s) => flow.edit(s.id)}
              onDismissEnded={flow.dismiss}
            />
            {flow.active ? <ActiveNote id={flow.active.id} initial={flow.active.notes ?? ''} /> : null}
          </Panel>

          <DemoNotice>Demo mode: sessions are saved on this device only and are not sent to anyone.</DemoNotice>

          <Section title="History">
            <Segmented
              label="Sleep history range"
              value={range}
              onChange={setRange}
              options={[
                { value: 'today', label: `Today · ${formatDuration(sleep.todayTotalMs)}` },
                { value: 'earlier', label: 'Earlier days' },
              ]}
            />
            <AsyncBlock
              status={sleep.status}
              error={sleep.error}
              onRetry={sleep.retry}
              loadingLabel="Loading sleep log"
              isEmpty={(range === 'today' ? sleep.today : earlier).length === 0}
              empty={
                <EmptyState
                  icon="moon"
                  title={range === 'today' ? 'Nothing logged yet today' : 'No earlier sessions'}
                  body={range === 'today' ? 'Sessions you end will appear here. Every day looks different, and that’s okay.' : 'Older sessions will collect here over time.'}
                />
              }>
              <SleepHistory sessions={range === 'today' ? sleep.today : earlier} onEdit={(s) => flow.edit(s.id)} />
            </AsyncBlock>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

function ActiveNote({ id, initial }: { id: string; initial: string }) {
  const flow = useSessionFlow();
  const [note, setNote] = useState(initial);
  const [saved, setSaved] = useState(false);
  const dirty = note.trim() !== initial.trim();
  return (
    <View style={{ gap: space.xs, marginTop: space.sm }}>
      <TextField
        label="Note (optional)"
        placeholder="Anything you want to remember"
        value={note}
        onChangeText={(t) => {
          setNote(t);
          setSaved(false);
        }}
      />
      {dirty ? (
        <Button
          label="Save note"
          size="sm"
          variant="secondary"
          loading={flow.sleep.isBusy(`update:${id}`)}
          onPress={async () => {
            await flow.sleep.update(id, { notes: note.trim() || undefined });
            setSaved(true);
          }}
          style={{ alignSelf: 'flex-start' }}
        />
      ) : saved ? (
        <T variant="caption">Note saved.</T>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  topBar: { position: 'absolute', left: space.md },
  body: {
    marginTop: -space.lg,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg - 4,
    paddingTop: space.lg,
    gap: space.lg,
  },
  timerPanel: { padding: space.lg - 4 },
});

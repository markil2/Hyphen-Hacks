import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { NURSERY, nurseryArt } from '@/components/scene/art/nursery';
import { AlertKey, LampHint, Readout } from '@/components/scene/Console';
import { PAGES, usePager } from '@/features/navigation/PagerContext';
import { LampChain } from '@/features/sleep/LampChain';
import { BabyMonitor } from '@/features/sleep/monitor/BabyMonitor';
import { sleepStats } from '@/features/sleep/sleepStats';
import { useSessionFlow } from '@/features/sleep/useSessionFlow';
import { useCalmMotion } from '@/lib/motion';
import { babyAge, formatClock, formatDuration, formatElapsed, useNow } from '@/lib/time';
import { stores, useDoc } from '@/state';

export function NurseryRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const flow = useSessionFlow();
  const calm = useCalmMotion();
  const pager = usePager();
  const [monitorOpen, setMonitorOpen] = useState(false);
  const light = useSharedValue(flow.active ? 0 : 1);

  // The lamp switches off while a session runs (quick, like a real switch) and
  // warms back up when it ends. It is feedback, not a cause.
  useEffect(() => {
    light.set(flow.active ? withTiming(0, { duration: calm ? 0 : 320 }) : withTiming(1, { duration: calm ? 0 : 700 }));
  }, [flow.active, calm, light]);

  const openMonitor = () => {
    pager.setLocked(true);
    scene.current?.focusOn(NURSERY.crib, () => setMonitorOpen(true));
  };
  const closeMonitor = () => {
    setMonitorOpen(false);
    pager.setLocked(false);
    scene.current?.reset(true);
  };

  // The nursery wall is dark (and darker still with the lamp off): use light status-bar text while it's on screen.
  const onScreen = pager.page === PAGES.rooms && pager.room === index;

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={nurseryArt}
      light={light}
      focusY={92}
      zoom={1.04}
      title="Nursery"
      dark
      description="Nursery: a wooden crib by the wall, a nightstand with a lamp, a small whiteboard timeline above it, and a round rug. A little pixel-art baby lies swaddled in the crib."
      objects={
        <>
          <InteractiveObject area={NURSERY.crib} label="Crib" hint="Opens the baby monitor and sleep dashboard" tag={flow.active ? 'Monitor · live' : 'Monitor'} alert={Boolean(flow.active)} onPress={openMonitor} />
          <InteractiveObject
            area={NURSERY.whiteboard}
            label="Whiteboard"
            hint="Opens a calm timeline of what usually happens around your baby's age"
            tag="Timeline"
            tagAt="above"
            onPress={() => scene.current?.focusOn(NURSERY.whiteboard, () => router.push('/nursery/timeline'))}
          />
          <InteractiveObject
            area={NURSERY.lampShade}
            label="Lamp"
            hint={flow.active ? 'Ends the sleep session in progress' : 'Starts a sleep session'}
            tag={null}
            onPress={flow.toggle}
            disabled={flow.busy}
          />
          <LampChain anchor={NURSERY.chainAnchor} active={Boolean(flow.active)} onPull={flow.toggle} disabled={flow.busy} />
        </>
      }
      sheet={<NurseryReadout flow={flow} onOpenMonitor={openMonitor} />}
      overlay={
        <>
          {onScreen ? <StatusBar style="light" /> : null}
          {monitorOpen ? <BabyMonitor flow={flow} onClosed={closeMonitor} /> : null}
        </>
      }
    />
  );
}

function NurseryReadout({ flow, onOpenMonitor }: { flow: ReturnType<typeof useSessionFlow>; onOpenMonitor: () => void }) {
  const now = useNow(flow.active ? 1000 : 30_000);

  if (flow.active) {
    return (
      <Readout
        led="amber"
        pulse
        label="Sleeping · lamp off"
        value={formatElapsed(now - new Date(flow.active.startedAt).getTime())}
        detail={`Since ${formatClock(flow.active.startedAt)}`}
        error={flow.error}
        aside={<AlertKey label="Live · open monitor" onPress={onOpenMonitor} />}
      />
    );
  }
  if (flow.justEnded) {
    const s = flow.justEnded;
    return (
      <Readout
        led="green"
        label="Sleep saved"
        value={formatDuration(new Date(s.endedAt!).getTime() - new Date(s.startedAt).getTime())}
        detail={`${formatClock(s.startedAt)} – ${formatClock(s.endedAt!)}`}
        live
        keys={[
          { label: 'Done', primary: true, onPress: flow.dismiss },
          { label: 'Fix times', icon: 'edit', onPress: () => flow.edit(s.id) },
        ]}
      />
    );
  }
  return <AwakeReadout flow={flow} now={now} />;
}

/** Lamp on: the baby at a glance, from the trackers, with a short summary of what's been logged. */
function AwakeReadout({ flow, now }: { flow: ReturnType<typeof useSessionFlow>; now: number }) {
  const baby = useDoc(stores.baby);
  const summary = useDoc(stores.babySummary);
  const stats = sleepStats(flow.sleep.items, now);
  const name = baby.value?.name ?? 'Baby';
  const awakeFor = stats.lastWokeAt ? formatDuration(now - new Date(stats.lastWokeAt).getTime()).replace('under a minute', 'just now') : null;

  return (
    <Readout
      led="green"
      label={[baby.value ? babyAge(baby.value.birthDate) : null, awakeFor ? `awake ${awakeFor}` : 'awake'].filter(Boolean).join(' · ')}
      value={name}
      detailLines={2}
      detail={summary.value ? `✦ ${summary.value.summary}` : summary.status === 'error' ? 'Summary unavailable right now.' : 'Reading today’s logs…'}
      error={flow.error}
      aside={<LampHint text="Pull chain to start sleep" />}
    />
  );
}

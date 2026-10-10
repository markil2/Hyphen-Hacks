import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { NURSERY, nurseryArt } from '@/components/scene/art/nursery';
import { DemoBadge, T } from '@/components/ui';
import { PAGES, usePager } from '@/features/navigation/PagerContext';
import { LampChain } from '@/features/sleep/LampChain';
import { BabyMonitor } from '@/features/sleep/monitor/BabyMonitor';
import { hm, sleepStats } from '@/features/sleep/sleepStats';
import { SleepTimer } from '@/features/sleep/SleepTimer';
import { useSessionFlow } from '@/features/sleep/useSessionFlow';
import { useCalmMotion } from '@/lib/motion';
import { space } from '@/theme';

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

  const stats = sleepStats(flow.sleep.items);
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
      subtitle="Sleep & comfort"
      dark
      description="Nursery: a wooden crib by the wall, a nightstand with a lamp, a soft toy and blocks on a round rug."
      objects={
        <>
          <InteractiveObject area={NURSERY.crib} label="Crib" hint="Opens the baby monitor and sleep dashboard" tag="Monitor" onPress={openMonitor} />
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
      sheet={
        <>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <T variant="caption" style={{ flex: 1 }}>
              {flow.sleep.status === 'ready'
                ? `Today: ${stats.todayCount} sleep${stats.todayCount === 1 ? '' : 's'}${stats.todayCount ? `, ${hm(stats.todayMinutes)}` : ''}`
                : flow.sleep.status === 'error'
                  ? 'Couldn’t load the sleep log.'
                  : 'Loading…'}
            </T>
            <DemoBadge origin={flow.sleep.items[0]?.origin ?? 'api'} label="Offline demo" />
          </View>
        </>
      }
      overlay={
        <>
          {onScreen ? <StatusBar style="light" /> : null}
          {monitorOpen ? <BabyMonitor flow={flow} onClosed={closeMonitor} /> : null}
        </>
      }
    />
  );
}

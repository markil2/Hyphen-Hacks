import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { NURSERY, nurseryArt } from '@/components/scene/art/nursery';
import { DemoBadge, T } from '@/components/ui';
import { LampChain } from '@/features/sleep/LampChain';
import { SleepTimer } from '@/features/sleep/SleepTimer';
import { useSessionFlow } from '@/features/sleep/useSessionFlow';
import { useCalmMotion } from '@/lib/motion';
import { formatDuration } from '@/lib/time';
import { space } from '@/theme';

export default function Nursery() {
  const scene = useRef<SceneHandle>(null);
  const flow = useSessionFlow();
  const calm = useCalmMotion();
  const light = useSharedValue(flow.active ? 0.18 : 1);

  // The lamp dims while a session runs; it is feedback, not a cause.
  useEffect(() => {
    light.value = withTiming(flow.active ? 0.18 : 1, { duration: calm ? 0 : 900 });
  }, [flow.active, calm, light]);

  const openCrib = () => scene.current?.focusOn(NURSERY.crib, () => router.push('/nursery/sleep'));
  const today = flow.sleep.today;

  return (
    <RoomShell
      sceneRef={scene}
      art={nurseryArt}
      light={light}
      focusY={92}
      zoom={1.04}
      title="Nursery"
      subtitle="Sleep & comfort"
      dark={Boolean(flow.active)}
      description="Nursery: a wooden crib by the wall, a nightstand with a lamp, a soft toy and blocks on the carpet."
      objects={
        <>
          <InteractiveObject area={NURSERY.crib} label="Crib" hint="Zooms in to your baby's sleep log" tag="Crib · sleep log" onPress={openCrib} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xxs }}>
            <T variant="caption" style={{ flex: 1 }}>
              {flow.sleep.status === 'ready'
                ? `Today so far: ${today.length} session${today.length === 1 ? '' : 's'}${today.length ? `, ${formatDuration(flow.sleep.todayTotalMs)}` : ''}`
                : ' '}
            </T>
            <DemoBadge label="Demo log" />
          </View>
        </>
      }
    />
  );
}

import { router } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { KITCHEN, kitchenArt } from '@/components/scene/art/kitchen';
import type { Rect } from '@/components/scene/geometry';
import { Button, DemoBadge, T } from '@/components/ui';
import { feedingDetail, feedingTitle, useFeedings } from '@/features/feeding/model';
import { relativeTime, useNow } from '@/lib/time';
import { space } from '@/theme';

export function KitchenRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const feedings = useFeedings();
  const now = useNow(60_000);
  const go = (area: Rect, path: '/kitchen/bottle' | '/kitchen/bowl' | '/kitchen/pantry') =>
    scene.current?.focusOn(area, () => router.push(path));
  const last = feedings.lastMilk;

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={kitchenArt}
      focusY={-8}
      zoom={1.1}
      title="Kitchen"
      subtitle="Feeding & nutrition"
      description="Kitchen: a window, a sage counter with a baby bottle, an open pantry shelf of jars, and a wooden high chair with a bowl on its tray."
      objects={
        <>
          <InteractiveObject area={KITCHEN.pantry} label="Pantry shelf" hint="Opens baby food and formula information" tag="Pantry" tagAt="inside" onPress={() => go(KITCHEN.pantry, '/kitchen/pantry')} />
          <InteractiveObject area={KITCHEN.bottle} label="Bottle" hint="Opens the milk feeding form" tag="Bottle" tagAt="below" onPress={() => go(KITCHEN.bottle, '/kitchen/bottle')} />
          <InteractiveObject area={KITCHEN.bowl} label="Bowl and spoon" hint="Opens the solid food log" tag="Bowl · solids" tagAt="above" onPress={() => go(KITCHEN.bowl, '/kitchen/bowl')} />
        </>
      }
      sheet={
        <>
          <View style={{ gap: 2 }}>
            <T variant="smallStrong">{last ? `Last milk feed ${relativeTime(last.at, now)}` : 'No feeds logged yet'}</T>
            <T variant="small">
              {last ? [feedingTitle(last), feedingDetail(last)].filter(Boolean).join(' · ') : 'Tap the bottle or the bowl, or use the button below.'}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Button label="Log a feeding" icon="plus" onPress={() => router.push('/kitchen/bottle')} style={{ flex: 1 }} />
            <Button label="Feeding log" variant="secondary" onPress={() => router.push('/kitchen/feeding')} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <T variant="caption" style={{ flex: 1 }}>
              {feedings.status === 'ready' ? `${feedings.milkToday.length} milk feed${feedings.milkToday.length === 1 ? '' : 's'} logged today` : ' '}
            </T>
            <DemoBadge origin={feedings.items[0]?.origin ?? 'api'} label="Offline demo" />
          </View>
        </>
      }
    />
  );
}

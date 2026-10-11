import { router } from 'expo-router';
import { useRef } from 'react';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { KITCHEN, kitchenArt } from '@/components/scene/art/kitchen';
import type { Rect } from '@/components/scene/geometry';
import { Readout } from '@/components/scene/Console';
import { feedingDetail, feedingTitle, useFeedings } from '@/features/feeding/model';
import { AGE_GATES, useBabyMonths } from '@/lib/age';
import { relativeTime, useNow } from '@/lib/time';

export function KitchenRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const feedings = useFeedings();
  const now = useNow(60_000);
  const go = (area: Rect, path: '/kitchen/bottle' | '/kitchen/bowl' | '/kitchen/pantry' | '/kitchen/fridge' | '/kitchen/shop') =>
    scene.current?.focusOn(area, () => router.push(path));
  const latest = feedings.items[0];
  const months = useBabyMonths();

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={kitchenArt}
      focusY={-8}
      zoom={1.1}
      title="Kitchen"
      subtitle="Feeding & nutrition"
      description="Kitchen: a window, a tall cream fridge with notes on the door, a sage counter with a paper shopping bag and a baby bottle, an open pantry shelf of jars, and a wooden high chair with a bowl on its tray."
      objects={
        <>
          <InteractiveObject area={KITCHEN.pantry} label="Pantry shelf" hint="Opens baby food and formula information" tag="Pantry" tagAt="inside" onPress={() => go(KITCHEN.pantry, '/kitchen/pantry')} />
          <InteractiveObject area={KITCHEN.bottle} label="Bottle" hint="Opens the milk feeding form" tag="Bottle" tagAt="below" onPress={() => go(KITCHEN.bottle, '/kitchen/bottle')} />
          {months !== null && months >= AGE_GATES.solids ? (
            <InteractiveObject area={KITCHEN.bowl} label="Food" hint="Opens the solid food log" tag="Food" tagAt="above" onPress={() => go(KITCHEN.bowl, '/kitchen/bowl')} />
          ) : null}
          <InteractiveObject area={KITCHEN.bag} label="Shopping bag" hint="Opens the baby food shop" tag="Shop" tagAt="below" onPress={() => go(KITCHEN.bag, '/kitchen/shop')} />
          <InteractiveObject area={KITCHEN.fridge} label="Fridge" hint="Baby’s health log, recipe ideas and family notes" tag="Fridge" tagAt="inside" onPress={() => go(KITCHEN.fridge, '/kitchen/fridge')} />
        </>
      }
      sheet={
        <Readout
          led={feedings.status === 'error' ? 'off' : 'green'}
          label="Last feed"
          value={feedings.status !== 'ready' ? (feedings.status === 'error' ? '—' : '…') : latest ? relativeTime(latest.at, now) : 'None yet'}
          detail={
            feedings.status === 'error'
              ? 'Couldn’t load the feeding log.'
              : latest
                ? [feedingTitle(latest), feedingDetail(latest), `today ${feedings.today.length}`].filter(Boolean).join(' · ')
                : months !== null && months < AGE_GATES.solids ? 'Tap the bottle to log one.' : 'Tap the bottle or the food to log one.'
          }
          keys={[
            { label: 'Log feed', icon: 'plus', primary: true, onPress: () => router.push('/kitchen/bottle') },
            { label: 'History', icon: 'history', onPress: () => router.push('/kitchen/feeding') },
          ]}
        />
      }
    />
  );
}

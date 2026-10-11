import { router } from 'expo-router';
import { useRef } from 'react';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { PLAY, playArt } from '@/components/scene/art/play';
import type { Rect } from '@/components/scene/geometry';
import { Readout } from '@/components/scene/Console';
import { relativeTime, useNow } from '@/lib/time';
import { stores, useCollection } from '@/state';

export function PlayRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const heights = useCollection(stores.heights);
  const milestones = useCollection(stores.milestones);
  const now = useNow(60_000);
  const latestH = heights.items[0];
  const weights = useCollection(stores.weights);
  const latestW = weights.items[0];
  const go = (area: Rect, path: '/development/milestones' | '/development/activities' | '/development/questions' | '/development/height' | '/development/weight') =>
    scene.current?.focusOn(area, () => router.push(path));

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={playArt}
      focusY={60}
      zoom={1.06}
      title="Play corner"
      subtitle="Growth, milestones & play"
      description="Play corner: a round play mat with stacking rings and a soft ball, a low shelf of picture books, and a wooden growth board on the wall, and a small sage cabinet with a baby scale on top beside it."
      objects={
        <>
          <InteractiveObject area={PLAY.growth} label="Growth board" hint="Opens the height ruler" tag="Height" tagAt="inside" tagShift={-26} onPress={() => go(PLAY.growth, '/development/height')} />
          <InteractiveObject area={PLAY.scale} label="Baby scale" hint="Opens the weight log" tag="Weight" tagAt="inside" onPress={() => go(PLAY.scale, '/development/weight')} />
          <InteractiveObject area={PLAY.mat} label="Play mat" hint="Opens activity ideas for this age" tag="Activities" tagAt="inside" onPress={() => go(PLAY.mat, '/development/activities')} />
          <InteractiveObject area={PLAY.books} label="Bookshelf" hint="Milestones you've noted, and questions for a professional" tag="Milestones" onPress={() => go(PLAY.books, '/development/milestones')} />
        </>
      }
      sheet={
        <Readout
          led="green"
          label="Growth"
          value={heights.status === 'ready' ? [latestH ? `${latestH.height} ${latestH.unit}` : null, latestW ? `${latestW.weight} ${latestW.unit}` : null].filter(Boolean).join(' · ') || 'Not measured yet' : '…'}
          detail={[latestH || latestW ? `Last measured ${relativeTime((latestW && (!latestH || latestW.measuredAt > latestH.measuredAt) ? latestW : latestH)!.measuredAt, now)}` : 'Growth board for height, scale for weight', `${milestones.items.length} milestone${milestones.items.length === 1 ? '' : 's'}`].join(' · ')}
          keys={[
            { label: 'Height', icon: 'ruler', primary: true, onPress: () => router.push('/development/height') },
            { label: 'Weight', icon: 'plus', onPress: () => router.push('/development/weight') },
          ]}
        />
      }
    />
  );
}

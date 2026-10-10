import { router } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { PLAY, playArt } from '@/components/scene/art/play';
import type { Rect } from '@/components/scene/geometry';
import { Button, T } from '@/components/ui';
import { space } from '@/theme';

export function PlayRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const go = (area: Rect, path: '/development/milestones' | '/development/activities' | '/development/questions' | '/development/height') =>
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
      description="Play corner: a round play mat with stacking rings and a soft ball, a low shelf of picture books, and a wooden growth board on the wall."
      objects={
        <>
          <InteractiveObject area={PLAY.growth} label="Growth board" hint="Opens the height ruler" tag="Height" tagAt="inside" tagShift={-26} onPress={() => go(PLAY.growth, '/development/height')} />
          <InteractiveObject area={PLAY.mat} label="Play mat" hint="Opens activity ideas for this age" tag="Activities" tagAt="inside" onPress={() => go(PLAY.mat, '/development/activities')} />
          <InteractiveObject area={PLAY.books} label="Bookshelf" hint="Milestones you've noted, and questions for a professional" tag="Milestones" onPress={() => go(PLAY.books, '/development/milestones')} />
        </>
      }
      sheet={
        <>
          <T variant="small">Every baby grows at their own pace. Notes here are yours; Nurture doesn’t score or interpret them.</T>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Button label="Height" icon="ruler" onPress={() => router.push('/development/height')} style={{ flex: 1 }} size="sm" />
            <Button label="Milestones" variant="secondary" onPress={() => router.push('/development/milestones')} style={{ flex: 1 }} size="sm" />
            <Button label="Play ideas" variant="secondary" onPress={() => router.push('/development/activities')} style={{ flex: 1 }} size="sm" />
          </View>
        </>
      }
    />
  );
}

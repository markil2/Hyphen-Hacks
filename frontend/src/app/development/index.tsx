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

export default function Development() {
  const scene = useRef<SceneHandle>(null);
  const go = (area: Rect, path: '/development/milestones' | '/development/activities' | '/development/questions') =>
    scene.current?.focusOn(area, () => router.push(path));

  return (
    <RoomShell
      sceneRef={scene}
      art={playArt}
      focusY={60}
      zoom={1.06}
      title="Play corner"
      subtitle="Milestones & activities"
      description="Play corner: a round play mat with stacking rings and a soft ball, a low shelf of picture books, and a wooden growth board on the wall."
      objects={
        <>
          <InteractiveObject area={PLAY.growth} label="Growth board" hint="Opens a gentle milestone timeline" tag="Milestones" tagAt="inside" tagShift={-30} onPress={() => go(PLAY.growth, '/development/milestones')} />
          <InteractiveObject area={PLAY.mat} label="Play mat" hint="Opens activity ideas for this age" tag="Activities" tagAt="inside" onPress={() => go(PLAY.mat, '/development/activities')} />
          <InteractiveObject area={PLAY.books} label="Bookshelf" hint="Questions to bring to a professional" tag="My questions" onPress={() => go(PLAY.books, '/development/questions')} />
        </>
      }
      sheet={
        <>
          <T variant="small">Every baby grows at their own pace. These are ideas and conversation starters, not checklists.</T>
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Button label="Activities" icon="play" onPress={() => router.push('/development/activities')} style={{ flex: 1 }} />
            <Button label="Milestones" variant="secondary" onPress={() => router.push('/development/milestones')} style={{ flex: 1 }} />
          </View>
        </>
      }
    />
  );
}

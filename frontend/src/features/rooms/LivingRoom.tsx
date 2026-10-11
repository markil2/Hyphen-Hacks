import { router } from 'expo-router';
import { useRef } from 'react';

import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { LIVING, livingArt } from '@/components/scene/art/living';
import type { Rect } from '@/components/scene/geometry';
import { Readout } from '@/components/scene/Console';
import { stores, useCatalog } from '@/state';

/** The living room: where parents bring questions and find people who can help. */
export function LivingRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const questions = useCatalog(stores.questions);
  const go = (area: Rect, path: '/support/ask' | '/support/experts' | '/support/questions' | '/support/you') =>
    scene.current?.focusOn(area, () => router.push(path));

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={livingArt}
      focusY={70}
      zoom={1.06}
      title="Living room"
      subtitle="Questions & expert support"
      description="Living room: a round mirror over a soft blue sofa with cushions, a side table with a phone, a floor lamp, and a bookshelf."
      objects={
        <>
          <InteractiveObject area={LIVING.mirror} label="Mirror" hint="For you: your own tracking, hormones and everyday measurements" tag="For you" tagAt="below" onPress={() => go(LIVING.mirror, '/support/you')} />
          <InteractiveObject area={LIVING.phone} label="Phone" hint="Opens a form to ask a question" tag="Ask a question" onPress={() => go(LIVING.phone, '/support/ask')} />
          <InteractiveObject area={LIVING.sofa} label="Sofa" hint="Browse expert profiles" tag="Find an expert" tagAt="inside" onPress={() => go(LIVING.sofa, '/support/experts')} />
          <InteractiveObject area={LIVING.bookshelf} label="Bookshelf" hint="Your questions, requests and saved answers" tag="My questions" tagAt="inside" tagShift={-34} onPress={() => go(LIVING.bookshelf, '/support/questions')} />
        </>
      }
      sheet={
        <Readout
          led="amber"
          label="Support"
          value={questions.status === 'ready' ? (questions.items.length ? `${questions.items.length} question${questions.items.length === 1 ? '' : 's'} saved` : 'Ask anything') : '…'}
          detail="Urgent? Call your pediatrician or emergency number now."
          keys={[
            { label: 'Ask', icon: 'support', primary: true, onPress: () => router.push('/support/ask') },
            { label: 'Experts', icon: 'search', onPress: () => router.push('/support/experts') },
          ]}
        />
      }
    />
  );
}

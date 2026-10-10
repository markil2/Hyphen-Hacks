import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { InteractiveObject } from '@/components/scene/InteractiveObject';
import { RoomShell } from '@/components/scene/RoomShell';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { CHANGING, changingArt } from '@/components/scene/art/changing';
import { Button, DemoBadge, T } from '@/components/ui';
import { diaperLabel, useDiapers } from '@/features/diapers/model';
import { formatClock, relativeTime, useNow } from '@/lib/time';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { DiaperEntry, DiaperKind } from '@/types';

/** One-tap diaper logging. Optional, and never interpreted. */
export function ChangingRoom({ index }: { index: number; active: boolean }) {
  const scene = useRef<SceneHandle>(null);
  const diapers = useDiapers();
  const now = useNow(60_000);
  const [last, setLast] = useState<DiaperEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const log = async (kind: DiaperKind) => {
    setError(null);
    try {
      setLast(await diapers.create({ kind, at: new Date().toISOString() }, 'quick'));
    } catch (e) {
      setError(messageOf(e));
    }
  };
  const latest = diapers.items[0];

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={changingArt}
      focusY={70}
      zoom={1.06}
      title="Changing area"
      subtitle="Diapers & daily care"
      description="Changing area: a wooden dresser with a sage changing pad, a round mirror, a shelf of folded cloths and a woven basket."
      objects={
        <>
          <InteractiveObject area={CHANGING.pad} label="Changing pad" hint="Log a change with time and notes" tag="Log with details" onPress={() => scene.current?.focusOn(CHANGING.pad, () => router.push('/changing/edit'))} />
          <InteractiveObject area={CHANGING.basket} label="Basket" hint="See today's changes and history" tag="History" onPress={() => scene.current?.focusOn(CHANGING.basket, () => router.push('/changing/history'))} />
        </>
      }
      sheet={
        <>
          {last ? (
            <Animated.View entering={FadeIn.duration(200)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }} accessibilityLiveRegion="polite">
              <Icon name="check" color={colors.sageDeep} strokeWidth={2.2} size={18} />
              <T variant="smallStrong" style={{ flex: 1 }}>
                {diaperLabel[last.kind]} logged at {formatClock(last.at)}
              </T>
              <Button label="Edit" size="sm" variant="quiet" onPress={() => router.push({ pathname: '/changing/edit', params: { id: last.id } })} />
              <Button
                label="Undo"
                size="sm"
                variant="quiet"
                onPress={async () => {
                  await diapers.remove(last.id);
                  setLast(null);
                }}
              />
            </Animated.View>
          ) : (
            <T variant="smallStrong">{latest ? `Last change ${relativeTime(latest.at, now)}` : 'Quick log'}</T>
          )}
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            {(['wet', 'dirty', 'both'] as DiaperKind[]).map((k) => (
              <Button key={k} label={diaperLabel[k]} variant={k === 'wet' ? 'primary' : 'secondary'} onPress={() => log(k)} disabled={diapers.isBusy('quick')} style={{ flex: 1, paddingHorizontal: 8 }} />
            ))}
          </View>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <T variant="caption" style={{ flex: 1 }}>
              {diapers.status === 'ready' ? `${diapers.today.length} change${diapers.today.length === 1 ? '' : 's'} today · logs the current time` : ' '}
            </T>
            <DemoBadge origin={diapers.items[0]?.origin ?? 'api'} label="Offline demo" />
          </View>
        </>
      }
    />
  );
}

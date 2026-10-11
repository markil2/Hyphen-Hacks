import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { CHANGING, changingArt } from '@/components/scene/art/changing';
import { screen } from '@/components/scene/Console';
import { InteractiveObject } from '@/components/scene/InteractiveObject';
import type { SceneHandle } from '@/components/scene/RoomScene';
import { RoomShell } from '@/components/scene/RoomShell';
import { T } from '@/components/ui';
import { diaperLabel, useDiapers } from '@/features/diapers/model';
import { haptic } from '@/lib/haptics';
import { formatClock, relativeTime, useNow } from '@/lib/time';
import { messageOf } from '@/state/store';
import { fonts } from '@/theme';
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
  const wet = diapers.today.filter((d) => d.kind !== 'dirty').length;
  const dirty = diapers.today.filter((d) => d.kind !== 'wet').length;

  return (
    <RoomShell
      index={index}
      sceneRef={scene}
      art={changingArt}
      focusY={70}
      zoom={1.06}
      title="Changing area"
      subtitle="Diapers & daily care"
      description="Changing area: a wooden dresser with a sage changing pad, a small framed print, a shelf of folded cloths and a woven basket."
      objects={
        <>
          <InteractiveObject area={CHANGING.pad} label="Changing pad" hint="Log a change with time and notes" tag="Log with details" onPress={() => scene.current?.focusOn(CHANGING.pad, () => router.push('/changing/edit'))} />
          <InteractiveObject area={CHANGING.basket} label="Basket" hint="See today's changes and history" tag="History" onPress={() => scene.current?.focusOn(CHANGING.basket, () => router.push('/changing/history'))} />
        </>
      }
      sheet={
        <View style={{ gap: 10 }}>
          <View style={styles.top}>
            <View style={{ flex: 1, minWidth: 0 }} accessible accessibilityLiveRegion="polite">
              <T style={styles.label}>{last ? `Logged · ${formatClock(last.at)}` : 'Last change'}</T>
              <T style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {last
                  ? diaperLabel[last.kind]
                  : diapers.status === 'error'
                    ? '—'
                    : diapers.status !== 'ready'
                      ? '…'
                      : latest
                        ? relativeTime(latest.at, now)
                        : 'None yet'}
              </T>
              <T style={styles.detail} numberOfLines={1}>
                {error ?? (diapers.status === 'error' ? 'Couldn’t load changes.' : last ? 'Saved with the time now.' : latest ? `${diaperLabel[latest.kind]} at ${formatClock(latest.at)}` : 'Tap a key below when you change one.')}
              </T>
            </View>
            <View style={styles.counters} accessible accessibilityLabel={`Today: ${diapers.today.length} changes, ${wet} wet, ${dirty} dirty`}>
              <Counter label="Today" value={diapers.today.length} />
              <Counter label="Wet" value={wet} />
              <Counter label="Dirty" value={dirty} />
            </View>
          </View>
          <View style={styles.keys}>
            {(['wet', 'dirty', 'both'] as DiaperKind[]).map((k) => (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={`Log a ${diaperLabel[k].toLowerCase()} change now`}
                disabled={diapers.isBusy('quick')}
                onPress={() => {
                  haptic.tap();
                  log(k);
                }}
                style={({ pressed }) => [styles.key, k === 'wet' && styles.keyPrimary, pressed && { opacity: 0.75 }]}>
                <Icon name={k === 'wet' ? 'drop' : k === 'dirty' ? 'diaper' : 'plus'} size={15} color={k === 'wet' ? '#2A211A' : screen.amber} />
                <T style={[styles.keyText, k === 'wet' && { color: '#2A211A' }]}>{k === 'both' ? 'Both' : diaperLabel[k]}</T>
              </Pressable>
            ))}
            {last ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Undo the last change"
                onPress={async () => {
                  await diapers.remove(last.id);
                  setLast(null);
                }}
                style={({ pressed }) => [styles.undo, pressed && { opacity: 0.7 }]}>
                <Icon name="back" size={16} color={screen.muted} />
              </Pressable>
            ) : null}
          </View>
        </View>     }
    />
  );
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.counter}>
      <T style={styles.counterValue}>{String(value).padStart(2, '0')}</T>
      <T style={styles.counterLabel}>{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  value: { fontFamily: fonts.lcd, fontSize: 26, lineHeight: 31, color: screen.amber, textShadowColor: 'rgba(242,201,138,0.5)', textShadowRadius: 8 },
  detail: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
  counters: { flexDirection: 'row', gap: 4 },
  counter: { alignItems: 'center', minWidth: 42, paddingVertical: 5, borderRadius: 8, backgroundColor: screen.card, borderWidth: 1, borderColor: 'rgba(242,201,138,0.12)' },
  counterValue: { fontFamily: fonts.lcd, fontSize: 18, color: screen.amber },
  counterLabel: { fontFamily: fonts.lcd, fontSize: 9.5, letterSpacing: 0.8, color: screen.muted, textTransform: 'uppercase' },
  keys: { flexDirection: 'row', gap: 6 },
  key: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(242,201,138,0.4)', backgroundColor: 'rgba(242,201,138,0.06)' },
  keyPrimary: { backgroundColor: screen.amber, borderColor: screen.amber },
  keyText: { fontFamily: fonts.lcd, fontSize: 14, letterSpacing: 0.8, color: screen.amber, textTransform: 'uppercase' },
  undo: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(243,236,224,0.15)' },
});

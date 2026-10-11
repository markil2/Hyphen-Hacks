import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { LcdPanel, screen } from '@/components/scene/Console';
import { MonitorScreen } from '@/components/scene/MonitorScreen';
import { T } from '@/components/ui';
import { AREA_LABEL, GuideItem, guideFor, windowLabel } from '@/features/timeline/guide';
import { useBabyMonths } from '@/lib/age';
import { fonts } from '@/theme';

/**
 * The whiteboard: what usually happens around now, and what's coming up.
 * Typical windows from public guidance, not deadlines — calm, not another checklist.
 */
export default function Timeline() {
  const months = useBabyMonths() ?? 0;
  const { now, soon, later, past } = guideFor(months);
  const [showLater, setShowLater] = useState(false);
  const [showPast, setShowPast] = useState(false);

  return (
    <MonitorScreen title="Timeline" subtitle={`At ${months === 0 ? 'newborn' : `${months} month${months === 1 ? '' : 's'}`}: what usually happens when`}>
      <Scale months={months} />
      <LcdPanel title="Around now">
        {now.length ? now.map((g) => <Item key={g.id} g={g} />) : <T style={styles.muted}>Nothing specific right now. Enjoy this stretch.</T>}
      </LcdPanel>
      <LcdPanel title="Next 3 months">{soon.length ? soon.map((g) => <Item key={g.id} g={g} />) : <T style={styles.muted}>Nothing new coming up soon.</T>}</LcdPanel>
      <Toggle label={`Later (${later.length})`} open={showLater} onPress={() => setShowLater((v) => !v)} />
      {showLater ? <LcdPanel>{later.map((g) => <Item key={g.id} g={g} />)}</LcdPanel> : null}
      <Toggle label={`Already behind you (${past.length})`} open={showPast} onPress={() => setShowPast((v) => !v)} />
      {showPast ? <LcdPanel>{past.map((g) => <Item key={g.id} g={g} />)}</LcdPanel> : null}
      <T style={styles.note}>
        Typical windows from the AAP and CDC, not deadlines. Every baby is different. If something worries you, your pediatrician is the best person to ask.
      </T>
    </MonitorScreen>
  );
}

function Scale({ months }: { months: number }) {
  const marks = [0, 6, 12, 18, 24, 36];
  const pct = Math.min(months, 36) / 36;
  return (
    <LcdPanel>
      <View style={styles.track} accessible accessibilityLabel={`Timeline: ${months} months of 36`}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        <View style={[styles.marker, { left: `${pct * 100}%` }]} />
      </View>
      <View style={styles.marks}>
        {marks.map((m) => (
          <T key={m} style={styles.mark}>
            {m === 0 ? 'birth' : m < 24 ? `${m}m` : `${m / 12}y`}
          </T>
        ))}
      </View>
    </LcdPanel>
  );
}

function Item({ g }: { g: GuideItem }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemHead}>
        <T style={styles.area}>{AREA_LABEL[g.area]}</T>
        <T style={styles.window}>{windowLabel(g)}</T>
      </View>
      <T style={styles.title}>{g.title}</T>
      <T style={styles.detail}>{g.detail}</T>
      <T style={styles.source}>Source: {g.source}</T>
    </View>
  );
}

function Toggle({ label, open, onPress }: { label: string; open: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onPress} style={styles.toggle}>
      <T style={styles.toggleText}>{label}</T>
      <Icon name={open ? 'up' : 'down'} size={14} color={screen.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(243,236,224,0.08)', marginTop: 6 },
  fill: { height: 8, borderRadius: 4, backgroundColor: 'rgba(242,201,138,0.45)' },
  marker: { position: 'absolute', top: -5, width: 18, height: 18, marginLeft: -9, borderRadius: 9, backgroundColor: screen.amber, borderWidth: 3, borderColor: screen.bg },
  marks: { flexDirection: 'row', justifyContent: 'space-between' },
  mark: { fontFamily: fonts.lcd, fontSize: 11, color: screen.muted },
  item: { gap: 3, paddingVertical: 6, borderTopWidth: 1, borderTopColor: 'rgba(243,236,224,0.07)' },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between' },
  area: { fontFamily: fonts.lcd, fontSize: 11, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  window: { fontFamily: fonts.lcd, fontSize: 12, color: screen.amber },
  title: { fontFamily: fonts.bodySemibold, fontSize: 15, color: screen.ink },
  detail: { fontFamily: fonts.body, fontSize: 13.5, lineHeight: 19, color: screen.muted },
  source: { fontFamily: fonts.lcd, fontSize: 10.5, color: 'rgba(169,158,144,0.7)' },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40, paddingHorizontal: 6 },
  toggleText: { fontFamily: fonts.lcd, fontSize: 13, letterSpacing: 1, color: screen.muted, textTransform: 'uppercase' },
  muted: { fontFamily: fonts.body, fontSize: 13, color: screen.muted },
  note: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: screen.muted, textAlign: 'center' },
});

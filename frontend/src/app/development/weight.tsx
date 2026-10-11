import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/icons';
import { LcdPanel, screen } from '@/components/scene/Console';
import { MonitorScreen } from '@/components/scene/MonitorScreen';
import { T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { dayLabel, relativeTime } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { fonts } from '@/theme';

/** The baby scale: a digital readout and a log of weights, stored exactly as entered. */
export default function Weight() {
  const weights = useCollection(stores.weights);
  const latest = weights.items[0];
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>(latest?.unit ?? 'lb');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const n = Number(value.replace(',', '.'));
    const ok = unit === 'kg' ? n >= 0.3 && n <= 40 : n >= 0.7 && n <= 90;
    if (!ok) return setError(unit === 'kg' ? 'Enter a weight between 0.3 and 40 kg.' : 'Enter a weight between 0.7 and 90 lb.');
    setError(null);
    try {
      await weights.create({ weight: Math.round(n * 100) / 100, unit, measuredAt: new Date().toISOString() }, 'create:weight');
      setValue('');
      haptic.success();
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <MonitorScreen title="Baby scale" subtitle="Weights you record, kept exactly as entered">
      <LcdPanel>
        <T style={styles.label}>{latest ? `Last weighed ${relativeTime(latest.measuredAt)}` : 'No weight yet'}</T>
        <T style={styles.readout} accessibilityLiveRegion="polite">
          {latest ? `${latest.weight.toFixed(2)} ${latest.unit}` : '--.-- ' + unit}
        </T>
      </LcdPanel>

      <LcdPanel title="New reading">
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel={`Weight in ${unit}`}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder={unit === 'kg' ? '0.00' : '0.0'}
            placeholderTextColor="#5E554B"
            style={styles.input}
          />
          {(['lb', 'kg'] as const).map((u) => (
            <Pressable key={u} accessibilityRole="radio" accessibilityState={{ checked: unit === u }} onPress={() => setUnit(u)} style={[styles.unit, unit === u && styles.unitOn]}>
              <T style={[styles.unitText, unit === u && { color: '#2A211A' }]}>{u}</T>
            </Pressable>
          ))}
        </View>
        {error ? (
          <T style={styles.error} accessibilityRole="alert">
            {error}
          </T>
        ) : null}
        <Pressable accessibilityRole="button" onPress={save} disabled={weights.isBusy('create:weight')} style={({ pressed }) => [styles.save, pressed && { opacity: 0.8 }]}>
          <Icon name="plus" size={16} color="#2A211A" strokeWidth={2} />
          <T style={styles.saveText}>{weights.isBusy('create:weight') ? 'Saving…' : 'Log weight'}</T>
        </Pressable>
      </LcdPanel>

      <LcdPanel title="History">
        {weights.items.length ? (
          weights.items.map((w) => (
            <View key={w.id} style={styles.row}>
              <T style={styles.rowDate}>{dayLabel(w.measuredAt)}</T>
              <T style={styles.rowValue}>
                {w.weight} {w.unit}
              </T>
              <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${w.weight} ${w.unit}`} onPress={() => weights.remove(w.id)} hitSlop={8}>
                <Icon name="trash" size={16} color={screen.muted} />
              </Pressable>
            </View>
          ))
        ) : (
          <T style={styles.muted}>Weigh on your home scale or note the number from a checkup.</T>
        )}
      </LcdPanel>
      <T style={styles.muted}>Nurture doesn’t calculate percentiles or judge weight gain. Your pediatrician can tell you what’s typical.</T>
    </MonitorScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.lcd, fontSize: 12, letterSpacing: 1.2, color: screen.muted, textTransform: 'uppercase' },
  readout: { fontFamily: fonts.lcd, fontSize: 52, lineHeight: 58, color: screen.amber, textAlign: 'center', textShadowColor: 'rgba(242,201,138,0.55)', textShadowRadius: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 52, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(242,201,138,0.4)', paddingHorizontal: 14, fontFamily: fonts.lcd, fontSize: 26, color: screen.amber },
  unit: { height: 52, minWidth: 52, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(242,201,138,0.4)', alignItems: 'center', justifyContent: 'center' },
  unitOn: { backgroundColor: screen.amber, borderColor: screen.amber },
  unitText: { fontFamily: fonts.lcd, fontSize: 16, color: screen.amber, textTransform: 'uppercase' },
  save: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, borderRadius: 10, backgroundColor: screen.amber },
  saveText: { fontFamily: fonts.lcd, fontSize: 15, letterSpacing: 1, color: '#2A211A', textTransform: 'uppercase' },
  error: { fontFamily: fonts.body, fontSize: 12.5, color: screen.red },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 34 },
  rowDate: { flex: 1, fontFamily: fonts.lcd, fontSize: 13, color: screen.muted },
  rowValue: { fontFamily: fonts.lcd, fontSize: 16, color: screen.amber },
  muted: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: screen.muted },
});

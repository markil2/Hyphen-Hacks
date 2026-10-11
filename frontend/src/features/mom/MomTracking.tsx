import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, IconButton, ListRow, Notice, Section, T, TextField } from '@/components/ui';
import { dayLabel, formatClock } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { HormoneEntry, HormoneSource, HormoneType, MomMeasurement, MomMeasureType } from '@/types';

export const HORMONES: { value: HormoneType; label: string; unit: string }[] = [
  { value: 'lh', label: 'LH', unit: 'mIU/mL' },
  { value: 'fsh', label: 'FSH', unit: 'mIU/mL' },
  { value: 'hcg', label: 'hCG', unit: 'mIU/mL' },
  { value: 'estrogen', label: 'Estrogen', unit: 'pg/mL' },
  { value: 'progesterone', label: 'Progesterone', unit: 'ng/mL' },
  { value: 'other', label: 'Other', unit: '' },
];
const hormoneLabel = (h: HormoneType) => HORMONES.find((x) => x.value === h)?.label ?? h;
const SOURCES: { value: HormoneSource; label: string }[] = [
  { value: 'home_test', label: 'Home test' },
  { value: 'lab', label: 'Lab result' },
  { value: 'manual_entry', label: 'Other' },
];

const num = (s: string) => Number(s.replace(',', '.'));
const when = (iso: string) => `${dayLabel(iso)}, ${formatClock(iso)}`;

/** The parent's own tracking: hormone results and everyday measurements, stored exactly as entered. */
export function MomTab({ onRecipes }: { onRecipes: () => void }) {
  return (
    <>
      <HormoneTracker onRecipes={onRecipes} />
      <Measurements />
      <Notice tone="sand" text="Your results are stored exactly as you enter them. Nurture doesn’t judge them as high or low, and doesn’t diagnose anything. Talk to your doctor or midwife about what they mean." />
    </>
  );
}

function HormoneTracker({ onRecipes }: { onRecipes: () => void }) {
  const hormones = useCollection(stores.hormones);
  const [hormone, setHormone] = useState<HormoneType>('lh');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('mIU/mL');
  const [source, setSource] = useState<HormoneSource>('home_test');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const pick = (h: HormoneType) => {
    setHormone(h);
    setUnit(HORMONES.find((x) => x.value === h)?.unit ?? '');
  };

  const save = async () => {
    const n = num(value);
    if (!value.trim() || !Number.isFinite(n) || n < 0) return setError('Enter the number from your result.');
    if (!unit.trim()) return setError('Add the unit shown on the result, e.g. mIU/mL.');
    setError(null);
    try {
      await hormones.create({ hormone, value: n, unit: unit.trim(), source, at: new Date().toISOString() }, 'create:hormone');
      setValue('');
      setSaved(true);
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Section title="Hormone tracker">
      <ChipRow value={hormone} onChange={pick} options={HORMONES.map(({ value: v, label }) => ({ value: v, label }))} />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}>
          <TextField label="Result" value={value} onChangeText={(t) => (setValue(t), setSaved(false))} keyboardType="decimal-pad" placeholder="e.g. 12.5" error={error ?? undefined} />
        </View>
        <View style={{ width: 120 }}>
          <TextField label="Unit" value={unit} onChangeText={setUnit} autoCapitalize="none" />
        </View>
      </View>
      <ChipRow label="From" value={source} onChange={setSource} options={SOURCES} />
      <Button label="Log result" icon="plus" onPress={save} loading={hormones.isBusy('create:hormone')} />
      {saved ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }} accessibilityLiveRegion="polite">
          <T variant="small" style={{ flex: 1, color: colors.sageDeep }}>
            Saved. Want meal ideas for this week?
          </T>
          <Button label="Recipe ideas" size="sm" variant="secondary" icon="leaf" onPress={onRecipes} />
        </View>
      ) : null}
      {hormones.items.slice(0, 8).map((h: HormoneEntry, i, all) => (
        <ListRow
          key={h.id}
          icon="drop"
          title={`${hormoneLabel(h.hormone)} · ${h.value} ${h.unit}`}
          subtitle={`${when(h.at)} · ${SOURCES.find((s) => s.value === h.source)?.label ?? 'Other'}`}
          last={i === all.length - 1}
          right={<IconButton icon="trash" tone="clear" label={`Remove ${hormoneLabel(h.hormone)} result`} onPress={() => hormones.remove(h.id)} disabled={hormones.isBusy(`remove:${h.id}`)} />}
        />
      ))}
    </Section>
  );
}

const MEASURES: { value: MomMeasureType; label: string }[] = [
  { value: 'weight', label: 'Weight' },
  { value: 'blood_pressure', label: 'Blood pressure' },
  { value: 'blood_glucose', label: 'Blood sugar' },
];

function describe(m: MomMeasurement) {
  if (m.type === 'blood_pressure') return `Blood pressure · ${m.systolic}/${m.diastolic}`;
  return `${MEASURES.find((x) => x.value === m.type)?.label} · ${m.value} ${m.unit}`;
}

function Measurements() {
  const items = useCollection(stores.momHealth);
  const [type, setType] = useState<MomMeasureType>('weight');
  const [value, setValue] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('lb');
  const [sugarUnit, setSugarUnit] = useState<'mg/dL' | 'mmol/L'>('mg/dL');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const at = new Date().toISOString();
    let input: Omit<MomMeasurement, 'id' | 'origin'>;
    if (type === 'blood_pressure') {
      const s = Math.round(num(sys));
      const d = Math.round(num(dia));
      if (!(s > 0 && d > 0)) return setError('Enter both numbers, e.g. 118 and 76.');
      input = { type, systolic: s, diastolic: d, at };
    } else {
      const n = num(value);
      if (!(n > 0)) return setError('Enter the number you measured.');
      input = { type, value: n, unit: type === 'weight' ? weightUnit : sugarUnit, at };
    }
    try {
      await items.create(input, 'create:measure');
      setValue('');
      setSys('');
      setDia('');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Section title="Measurements">
      <ChipRow value={type} onChange={(t) => (setType(t), setError(null))} options={MEASURES} />
      {type === 'blood_pressure' ? (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <TextField label="Top (systolic)" value={sys} onChangeText={setSys} keyboardType="number-pad" placeholder="e.g. 118" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Bottom (diastolic)" value={dia} onChangeText={setDia} keyboardType="number-pad" placeholder="e.g. 76" />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <TextField label={type === 'weight' ? 'Weight' : 'Blood sugar'} value={value} onChangeText={setValue} keyboardType="decimal-pad" />
          </View>
          {type === 'weight' ? (
            <ChipRow value={weightUnit} onChange={setWeightUnit} options={[{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }]} />
          ) : (
            <ChipRow value={sugarUnit} onChange={setSugarUnit} options={[{ value: 'mg/dL', label: 'mg/dL' }, { value: 'mmol/L', label: 'mmol/L' }]} />
          )}
        </View>
      )}
      {error ? (
        <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          {error}
        </T>
      ) : null}
      <Button label="Log measurement" icon="plus" variant="secondary" onPress={save} loading={items.isBusy('create:measure')} />
      {items.items.slice(0, 8).map((m, i, all) => (
        <ListRow
          key={m.id}
          icon="heart"
          title={describe(m)}
          subtitle={when(m.at)}
          last={i === all.length - 1}
          right={<IconButton icon="trash" tone="clear" label={`Remove ${describe(m)}`} onPress={() => items.remove(m.id)} disabled={items.isBusy(`remove:${m.id}`)} />}
        />
      ))}
    </Section>
  );
}

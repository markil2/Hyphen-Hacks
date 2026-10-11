import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, IconButton, ListRow, Notice, Section, T, TextField } from '@/components/ui';
import { UrgentHelp } from '@/features/support/UrgentHelp';
import { dayLabel, formatClock } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { BabyHealthEntry, BabyHealthType, Severity } from '@/types';

const TYPES: { value: BabyHealthType; label: string; prompt: string }[] = [
  { value: 'temperature', label: 'Temperature', prompt: 'Where was it taken? (optional)' },
  { value: 'medication', label: 'Medicine', prompt: 'What, and how much?' },
  { value: 'symptom', label: 'Symptom', prompt: 'What did you notice?' },
  { value: 'appointment', label: 'Appointment', prompt: 'Who, and what was discussed?' },
  { value: 'general', label: 'Note', prompt: 'What would you like to remember?' },
];
const label = (t: BabyHealthType) => TYPES.find((x) => x.value === t)?.label ?? t;

function describe(h: BabyHealthEntry) {
  if (h.type === 'temperature') return `Temperature · ${h.value}°${h.unit === 'C' ? 'C' : 'F'}`;
  return [label(h.type), h.severity, h.notes].filter(Boolean).join(' · ');
}

/** The baby's health notes: temperatures, medicine, symptoms, appointments. Recorded, never assessed. */
export function BabyHealthTab() {
  const items = useCollection(stores.babyHealth);
  const [type, setType] = useState<BabyHealthType>('temperature');
  const [temp, setTemp] = useState('');
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    const at = new Date().toISOString();
    let input: Omit<BabyHealthEntry, 'id' | 'origin'>;
    if (type === 'temperature') {
      const n = Number(temp.replace(',', '.'));
      if (!(n > 0)) return setError('Enter the reading, e.g. 98.6.');
      input = { type, value: n, unit, at, notes: notes.trim() || undefined };
    } else {
      if (!notes.trim()) return setError('Add a few words so you remember what this was.');
      input = { type, at, notes: notes.trim(), ...(type === 'symptom' && severity ? { severity } : {}) };
    }
    try {
      await items.create(input, 'create:babyHealth');
      setTemp('');
      setNotes('');
      setSeverity(null);
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <>
      <UrgentHelp compact />
      <Section title="Add to the log">
        <ChipRow value={type} onChange={(t) => (setType(t), setError(null))} options={TYPES.map(({ value, label: l }) => ({ value, label: l }))} />
        {type === 'temperature' ? (
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextField label="Reading" value={temp} onChangeText={setTemp} keyboardType="decimal-pad" placeholder={unit === 'F' ? 'e.g. 98.6' : 'e.g. 37.0'} />
            </View>
            <ChipRow value={unit} onChange={setUnit} options={[{ value: 'F', label: '°F' }, { value: 'C', label: '°C' }]} />
          </View>
        ) : null}
        {type === 'symptom' ? (
          <ChipRow
            label="How much is it bothering them? (optional)"
            value={severity}
            onChange={setSeverity}
            options={[
              { value: 'mild', label: 'A little' },
              { value: 'moderate', label: 'Some' },
              { value: 'severe', label: 'A lot' },
            ]}
          />
        ) : null}
        <TextField label={TYPES.find((t) => t.value === type)!.prompt} value={notes} onChangeText={setNotes} multiline />
        {error ? (
          <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </T>
        ) : null}
        <Button label="Save to the log" icon="plus" onPress={save} loading={items.isBusy('create:babyHealth')} />
      </Section>

      {items.items.length ? (
        <Section title="Recent">
          {items.items.slice(0, 15).map((h, i, all) => (
            <ListRow
              key={h.id}
              icon={h.type === 'temperature' ? 'drop' : h.type === 'medication' ? 'plus' : h.type === 'appointment' ? 'calendar' : 'heart'}
              title={describe(h)}
              subtitle={`${dayLabel(h.at)}, ${formatClock(h.at)}`}
              last={i === all.length - 1}
              right={<IconButton icon="trash" tone="clear" label={`Remove ${label(h.type)} entry`} onPress={() => items.remove(h.id)} disabled={items.isBusy(`remove:${h.id}`)} />}
            />
          ))}
        </Section>
      ) : null}
      <Notice tone="sand" text="A record for you and your pediatrician. Nurture doesn’t assess temperatures or symptoms." />
    </>
  );
}

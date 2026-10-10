import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AmountStepper, Button, ChipRow, DemoNotice, goBack, Screen, T, TextField, TimeEditor } from '@/components/ui';
import { mlToOz, useFeedings } from '@/features/feeding/model';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { FeedingEntry } from '@/types';

type Method = 'nursing' | 'pumped' | 'formula';

/**
 * Quick milk-feed logging. Defaults are ready to save in one tap;
 * only the fields that make sense for the chosen method are shown.
 */
export default function BottleForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const feedings = useFeedings();
  const existing = id ? feedings.items.find((f) => f.id === id && f.kind !== 'solid') : undefined;
  if (id && !existing && feedings.status !== 'ready') return <Screen sheet back title="Edit feeding">{null}</Screen>;
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function methodOf(f?: FeedingEntry): Method {
  if (!f) return 'nursing';
  if (f.kind === 'formula') return 'formula';
  if (f.kind === 'breast' && f.method === 'bottle') return 'pumped';
  return 'nursing';
}

function Form({ existing }: { existing?: FeedingEntry }) {
  const feedings = useFeedings();
  const [method, setMethod] = useState<Method>(methodOf(existing));
  const [at, setAt] = useState(existing?.at ?? new Date().toISOString());
  const [duration, setDuration] = useState<number | undefined>(existing?.kind === 'breast' && existing.method === 'nursing' ? existing.durationMin : undefined);
  const [amount, setAmount] = useState<number | undefined>(
    existing && (existing.kind === 'formula' || (existing.kind === 'breast' && existing.method === 'bottle')) ? existing.amountMl : undefined,
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busyKey = existing ? `update:${existing.id}` : 'create:feeding';
  const saving = feedings.isBusy(busyKey);

  const build = () => {
    const base = { at, notes: notes.trim() || undefined };
    if (method === 'nursing') return { ...base, kind: 'breast' as const, method: 'nursing' as const, durationMin: duration };
    if (method === 'pumped') return { ...base, kind: 'breast' as const, method: 'bottle' as const, amountMl: amount };
    return { ...base, kind: 'formula' as const, amountMl: amount };
  };

  const save = async () => {
    setError(null);
    try {
      if (existing) await feedings.update(existing.id, build());
      else await feedings.create(build(), busyKey);
      goBack('/kitchen');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!confirmDelete) return setConfirmDelete(true);
    try {
      await feedings.remove(existing.id);
      goBack('/kitchen/feeding');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen sheet
      back
      title={existing ? 'Edit feeding' : 'Log a feeding'}
      subtitle="Only what’s useful to you. Everything except the time is optional."
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label={existing ? 'Save changes' : 'Save feeding'} onPress={save} loading={saving} full size="lg" />
        </View>
      }>
      <ChipRow
        label="How"
        value={method}
        onChange={setMethod}
        options={[
          { value: 'nursing', label: 'Nursing' },
          { value: 'pumped', label: 'Breast milk, bottle' },
          { value: 'formula', label: 'Formula' },
        ]}
      />
      <TimeEditor label="Time" value={at} onChange={setAt} />
      {method === 'nursing' ? (
        <>
          <AmountStepper label="Duration" unit="min" value={duration} onChange={setDuration} step={5} max={120} />
        </>
      ) : (
        <View style={{ gap: 4 }}>
          <AmountStepper label="Amount" unit="ml" value={amount} onChange={setAmount} step={10} max={400} />
          {amount ? <T variant="caption">About {mlToOz(amount)} oz</T> : null}
        </View>
      )}
      <TextField label="Note (optional)" placeholder="e.g. who fed, how it went" value={notes} onChangeText={setNotes} multiline />
      {existing ? (
        <Button
          label={confirmDelete ? 'Tap again to remove this entry' : 'Remove entry'}
          icon="trash"
          variant="danger"
          onPress={remove}
          loading={feedings.isBusy(`remove:${existing.id}`)}
        />
      ) : null}
      <DemoNotice>Offline demo: feedings are saved on this device only.</DemoNotice>
    </Screen>
  );
}

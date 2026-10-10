import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, goBack, Screen, T, TextField, TimeEditor } from '@/components/ui';
import { diaperLabel, useDiapers } from '@/features/diapers/model';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { DiaperEntry, DiaperKind } from '@/types';

export default function EditDiaper() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const diapers = useDiapers();
  const existing = id ? diapers.items.find((d) => d.id === id) : undefined;
  if (id && !existing && diapers.status !== 'ready') return <Screen back title="Edit change">{null}</Screen>;
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing?: DiaperEntry }) {
  const diapers = useDiapers();
  const [kind, setKind] = useState<DiaperKind>(existing?.kind ?? 'wet');
  const [at, setAt] = useState(existing?.at ?? new Date().toISOString());
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = existing ? `update:${existing.id}` : 'create:diaper';

  const save = async () => {
    setError(null);
    const input = { kind, at, notes: notes.trim() || undefined };
    try {
      if (existing) await diapers.update(existing.id, input);
      else await diapers.create(input, key);
      goBack('/changing');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!confirmDelete) return setConfirmDelete(true);
    try {
      await diapers.remove(existing.id);
      goBack('/changing/history');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen
      back
      title={existing ? 'Edit change' : 'Log a change'}
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label={existing ? 'Save changes' : 'Save'} onPress={save} loading={diapers.isBusy(key)} size="lg" full />
        </View>
      }>
      <ChipRow label="Type" value={kind} onChange={setKind} options={(['wet', 'dirty', 'both'] as DiaperKind[]).map((k) => ({ value: k, label: diaperLabel[k] }))} />
      <TimeEditor label="Time" value={at} onChange={setAt} />
      <TextField label="Note (optional)" placeholder="Anything you want to remember" value={notes} onChangeText={setNotes} multiline />
      <T variant="caption">If something about a change worries you, your pediatrician is the right person to ask.</T>
      {existing ? (
        <Button label={confirmDelete ? 'Tap again to remove this entry' : 'Remove entry'} icon="trash" variant="danger" onPress={remove} loading={diapers.isBusy(`remove:${existing.id}`)} />
      ) : null}
    </Screen>
  );
}

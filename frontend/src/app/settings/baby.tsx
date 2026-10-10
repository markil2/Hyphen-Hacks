import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, goBack, LoadingState, Screen, T, TextField } from '@/components/ui';
import { babyAge, shiftDays } from '@/lib/time';
import { stores, useDoc } from '@/state';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { Baby } from '@/types';

/** Edit the baby's name and birth date (PATCH /babies/:id). */
export default function EditBaby() {
  const baby = useDoc(stores.baby);
  if (!baby.value) return <Screen back title="Baby’s details"><LoadingState /></Screen>;
  return <Form baby={baby.value} />;
}

function Form({ baby }: { baby: Baby }) {
  const doc = useDoc(stores.baby);
  const [name, setName] = useState(baby.name);
  const [birth, setBirth] = useState(baby.birthDate);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return setError('The name can’t be empty.');
    setError(null);
    try {
      await doc.save({ ...baby, name: name.trim(), birthDate: birth });
      stores.dashboard.load(true);
      goBack('/');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen
      back
      sheet
      title="Baby’s details"
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Save" onPress={submit} loading={doc.saving} size="lg" full />
        </View>
      }>
      <TextField label="Name" value={name} onChangeText={setName} />
      <View style={{ gap: space.xs }}>
        <T variant="smallStrong">Birth date</T>
        <T variant="heading">{new Date(birth).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</T>
        <T variant="caption">{babyAge(birth)}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {(
            [
              [-7, '−1 week'],
              [-1, '−1 day'],
              [1, '+1 day'],
              [7, '+1 week'],
            ] as const
          ).map(([d, label]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`Birth date ${label}`}
              onPress={() => setBirth(shiftDays(birth, d))}
              style={{ minHeight: 40, paddingHorizontal: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.paper, justifyContent: 'center' }}>
              <T variant="smallStrong">{label}</T>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

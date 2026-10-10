import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, ChipRow, goBack, LoadingState, Screen, T, TextField } from '@/components/ui';
import { useProfile } from '@/features/profile/useProfile';
import { babyAge, shiftDays } from '@/lib/time';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { BabyProfile, Profile } from '@/types';

export default function EditProfile() {
  const { profile } = useProfile();
  if (!profile) return <Screen back title="Edit details"><LoadingState /></Screen>;
  return <Form profile={profile} />;
}

function Form({ profile }: { profile: Profile }) {
  const { save, saving } = useProfile();
  const [parentName, setParentName] = useState(profile.parent.name);
  const [partnerName, setPartnerName] = useState(profile.partnerName ?? '');
  const [babyName, setBabyName] = useState(profile.baby.name);
  const [birth, setBirth] = useState(profile.baby.birthDate);
  const [pronoun, setPronoun] = useState<BabyProfile['pronoun']>(profile.baby.pronoun);
  const [error, setError] = useState<string | null>(null);

  const shift = (days: number) => setBirth(shiftDays(birth, days));

  const submit = async () => {
    if (!parentName.trim() || !babyName.trim()) return setError('Names can’t be empty.');
    setError(null);
    try {
      await save({
        ...profile,
        parent: { ...profile.parent, name: parentName.trim() },
        partnerName: partnerName.trim() || undefined,
        baby: { name: babyName.trim(), birthDate: birth, pronoun },
      });
      goBack('/profile');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen
      back
      title="Edit details"
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Save" onPress={submit} loading={saving} size="lg" full />
        </View>
      }>
      <TextField label="Your name" value={parentName} onChangeText={setParentName} />
      <TextField label="Partner or co-parent (optional)" value={partnerName} onChangeText={setPartnerName} />
      <TextField label="Baby’s name" value={babyName} onChangeText={setBabyName} />
      <ChipRow label="Baby’s pronouns" value={pronoun} onChange={setPronoun} options={[{ value: 'they', label: 'They' }, { value: 'she', label: 'She' }, { value: 'he', label: 'He' }]} />
      <View style={{ gap: space.xs }}>
        <T variant="smallStrong">Birth date</T>
        <T variant="heading">
          {new Date(birth).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </T>
        <T variant="caption">{babyAge(birth)}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {[
            [-7, '−1 week'],
            [-1, '−1 day'],
            [1, '+1 day'],
            [7, '+1 week'],
          ].map(([d, label]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityLabel={`Birth date ${label}`}
              onPress={() => shift(d as number)}
              style={{ minHeight: 40, paddingHorizontal: space.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.paper, justifyContent: 'center' }}>
              <T variant="smallStrong">{label}</T>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

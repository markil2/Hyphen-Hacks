import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Screen, T, TextField } from '@/components/ui';
import { AuthHero } from '@/features/auth/AuthHero';
import { authActions } from '@/features/auth/session';
import { babyAge, DAY, shiftDays } from '@/lib/time';
import { remote } from '@/services';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';

/** First run after sign-up: the one thing the app needs before it can open the rooms. */
export default function Onboarding() {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState(() => new Date(Date.now() - 30 * DAY).toISOString());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    if (!name.trim()) return setError('Add your baby’s name (a nickname is fine).');
    setBusy(true);
    setError(null);
    try {
      await remote.babies.create({ name: name.trim(), birthDate: birth });
      authActions.babyCreated();
    } catch (e) {
      setError(messageOf(e));
      setBusy(false);
    }
  };

  return (
    <Screen
      bounces={false}
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Open the nursery" onPress={submit} loading={busy} size="lg" full />
          <Button label="Sign out" variant="quiet" onPress={authActions.signOut} />
        </View>
      }>
      <AuthHero title="Who are we caring for?" subtitle="Just a name and a birth date. You can change these later." />
      <TextField label="Baby’s name" value={name} onChangeText={setName} placeholder="e.g. Robin" />
      <View style={{ gap: space.xs }}>
        <T variant="smallStrong">Birth date</T>
        <T variant="heading">{new Date(birth).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</T>
        <T variant="caption">{babyAge(birth)}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {(
            [
              [-30, '−1 month'],
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

import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Notice, Panel, Screen, T, TextField } from '@/components/ui';
import { authMessage } from '@/features/auth/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async () => {
    if (busy || !supabase) return;
    if (!name.trim()) return setError('Add your first name so we know what to call you.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Choose a password with at least 8 characters.');
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
    setBusy(false);
    if (e) return setError(authMessage(e));
    // With email confirmation on, there's no session until the link is opened.
    if (!data.session) setConfirmSent(true);
  };

  if (confirmSent) {
    return (
      <Screen back title="Check your email">
        <Panel tone="white">
          <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
            <Icon name="mail" color={colors.sageDeep} />
            <T variant="bodyStrong">We sent a link to {email.trim()}</T>
          </View>
          <T>Open it to confirm your account, then come back and sign in.</T>
        </Panel>
        <Notice tone="sand" text="Can’t find it? Check your spam folder. The link expires after a day." />
        <Button label="Back to sign in" onPress={() => router.replace('/auth/sign-in')} size="lg" full />
      </Screen>
    );
  }

  return (
    <Screen
      back
      title="Create your account"
      subtitle="One account per parent or caregiver. You can invite each other later."
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Create account" onPress={submit} loading={busy} size="lg" full />
        </View>
      }>
      <TextField label="Your first name" value={name} onChangeText={setName} autoComplete="given-name" textContentType="givenName" />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" hint="At least 8 characters." />
      <T variant="caption">Your care notes stay private to you and the family members you invite.</T>
    </Screen>
  );
}

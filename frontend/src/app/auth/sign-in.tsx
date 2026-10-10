import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, T, TextField } from '@/components/ui';
import { AuthHero } from '@/features/auth/AuthHero';
import { authActions, authMessage, useAuth } from '@/features/auth/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

export default function SignIn() {
  const { serverDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy || !supabase) return;
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    // On success the session listener moves the app on by itself.
    if (e) setError(authMessage(e));
  };

  return (
    <Screen bounces={false}>
      <AuthHero title="Welcome back" subtitle="Sign in to pick up where you left off." />
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
      {error ? (
        <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          {error}
        </T>
      ) : null}
      <View style={{ gap: space.xs }}>
        <Button label="Sign in" onPress={submit} loading={busy} size="lg" full />
        <Button label="Forgot your password?" variant="quiet" onPress={() => router.push('/auth/forgot')} />
      </View>
      <View style={{ gap: space.xs, marginTop: space.sm }}>
        <T variant="small" style={{ textAlign: 'center' }}>
          New to Nurture?
        </T>
        <Button label="Create an account" variant="secondary" onPress={() => router.push('/auth/sign-up')} full />
        {serverDemoMode ? <Button label="Explore the demo without an account" variant="quiet" onPress={authActions.enterDemo} /> : null}
      </View>
    </Screen>
  );
}

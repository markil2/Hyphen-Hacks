import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice, Screen, T, TextField } from '@/components/ui';
import { authMessage } from '@/features/auth/session';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

/**
 * Password reset with an emailed code, so it works inside the app without deep links.
 * Requires the Supabase "Reset password" email template to include {{ .Token }}.
 */
export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    if (busy || !supabase) return;
    if (!email.includes('@')) return setError('Enter the email you signed up with.');
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (e) return setError(authMessage(e));
    setStep('code');
  };

  const reset = async () => {
    if (busy || !supabase) return;
    if (code.trim().length < 6) return setError('Enter the code from the email.');
    if (password.length < 8) return setError('Choose a password with at least 8 characters.');
    setBusy(true);
    setError(null);
    const verified = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
    if (verified.error) {
      setBusy(false);
      return setError(authMessage(verified.error));
    }
    const { error: e } = await supabase.auth.updateUser({ password });
    setBusy(false);
    // Verifying the code signed them in; the session listener takes it from here.
    if (e) setError(authMessage(e));
  };

  const errorLine = error ? (
    <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
      {error}
    </T>
  ) : null;

  if (step === 'code') {
    return (
      <Screen back={() => setStep('email')} title="Enter your code" subtitle={`We emailed a code to ${email.trim()}.`}>
        <TextField label="Code" value={code} onChangeText={setCode} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10} />
        <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" hint="At least 8 characters." />
        {errorLine}
        <View style={{ gap: space.xs }}>
          <Button label="Set new password" onPress={reset} loading={busy} size="lg" full />
          <Button label="Send a new code" variant="quiet" onPress={sendCode} disabled={busy} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title="Reset your password" subtitle="We’ll email you a code to set a new one.">
      <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
      {errorLine}
      <Button label="Email me a code" onPress={sendCode} loading={busy} size="lg" full />
      <Notice tone="sand" text="If there’s no account for this email, nothing is sent." />
      <Button label="Back to sign in" variant="quiet" onPress={() => router.back()} />
    </Screen>
  );
}

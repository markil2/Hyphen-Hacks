import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice, Panel, Screen, Section, T, TextField } from '@/components/ui';
import { authActions, authMessage, useAuth } from '@/features/auth/session';
import { supabase } from '@/lib/supabase';
import { remote } from '@/services';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

/** Sign-in details live in Supabase Auth; the Nurture profile lives on the server. */
export default function AccountSettings() {
  const { session } = useAuth();
  const email = session?.user.email ?? '';

  const [password, setPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const changePassword = async () => {
    if (!supabase || pwBusy) return;
    if (password.length < 8) return setPwMessage({ ok: false, text: 'Choose a password with at least 8 characters.' });
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwBusy(false);
    setPassword('');
    setPwMessage(error ? { ok: false, text: authMessage(error) } : { ok: true, text: 'Password updated.' });
  };

  const deleteAccount = async () => {
    if (deleting || confirm.trim().toUpperCase() !== 'DELETE') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await remote.account.remove();
      await authActions.signOut();
    } catch (e) {
      setDeleteError(messageOf(e));
      setDeleting(false);
    }
  };

  return (
    <Screen sheet back title="Account">
      <Panel tone="white">
        <T variant="smallStrong">Signed in as</T>
        <T>{email}</T>
      </Panel>

      <Section title="Change password">
        <TextField label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" hint="At least 8 characters." />
        {pwMessage ? (
          <T variant="small" style={{ color: pwMessage.ok ? colors.sageDeep : colors.danger }} accessibilityLiveRegion="polite">
            {pwMessage.text}
          </T>
        ) : null}
        <Button label="Update password" variant="secondary" onPress={changePassword} loading={pwBusy} />
      </Section>

      <Button label="Sign out" icon="back" variant="secondary" onPress={authActions.signOut} />

      <Section title="Delete account">
        <Notice
          tone="danger"
          icon="alert"
          text="This removes your profile, questions and private tracking, and your sign-in. Baby records you share with family members stay with them. This can’t be undone."
        />
        <TextField label="Type DELETE to confirm" value={confirm} onChangeText={setConfirm} autoCapitalize="characters" />
        {deleteError ? (
          <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {deleteError}
          </T>
        ) : null}
        <View>
          <Button label="Delete my account" variant="danger" onPress={deleteAccount} loading={deleting} disabled={confirm.trim().toUpperCase() !== 'DELETE'} />
        </View>
      </Section>
      <View style={{ height: space.lg }} />
    </Screen>
  );
}

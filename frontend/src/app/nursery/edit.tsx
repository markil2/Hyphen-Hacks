import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, EmptyState, goBack, Screen, T, TextField, TimeEditor } from '@/components/ui';
import { durationOf, useSleep } from '@/features/sleep/useSleep';
import { formatDuration } from '@/lib/time';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { SleepSession } from '@/types';

/** Correct a mistaken start or end time, add a note, or remove a session. */
export default function EditSleep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sleep = useSleep();
  const session = sleep.items.find((s) => s.id === id);

  if (!session) {
    return (
      <Screen sheet title="Edit session" back>
        {sleep.status === 'ready' ? <EmptyState title="This session no longer exists" body="It may have been removed." /> : null}
      </Screen>
    );
  }
  return <Editor session={session} />;
}

function Editor({ session }: { session: SleepSession }) {
  const sleep = useSleep();
  const [startedAt, setStartedAt] = useState(session.startedAt);
  const [endedAt, setEndedAt] = useState(session.endedAt);
  const [notes, setNotes] = useState(session.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalid = endedAt !== null && endedAt <= startedAt;
  const saving = sleep.isBusy(`update:${session.id}`);
  const removing = sleep.isBusy(`remove:${session.id}`);

  const save = async () => {
    if (invalid) return;
    setError(null);
    try {
      await sleep.update(session.id, { startedAt, endedAt, notes: notes.trim() || undefined });
      goBack('/nursery/sleep');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const remove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await sleep.remove(session.id);
      goBack('/nursery/sleep');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen sheet
      title={session.endedAt ? 'Edit session' : 'Adjust start time'}
      subtitle={endedAt ? `${formatDuration(durationOf({ ...session, startedAt, endedAt }))} total` : 'Session in progress'}
      back
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Save changes" onPress={save} loading={saving} disabled={invalid} full size="lg" />
        </View>
      }>
      <TimeEditor label="Started" value={startedAt} onChange={setStartedAt} />
      {endedAt !== null ? <TimeEditor label="Ended" value={endedAt} onChange={setEndedAt} notBefore={startedAt} /> : null}
      {invalid ? (
        <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          The end time needs to be after the start time.
        </T>
      ) : null}
      <TextField label="Note (optional)" placeholder="Anything you want to remember" value={notes} onChangeText={setNotes} multiline />
      <Button
        label={confirmDelete ? 'Tap again to remove this session' : 'Remove session'}
        icon="trash"
        variant="danger"
        onPress={remove}
        loading={removing}
        accessibilityHint="Removes this session from the log"
      />
    </Screen>
  );
}

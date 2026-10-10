import { useState } from 'react';

import { AsyncBlock, Button, EmptyState, IconButton, ListRow, Screen, Section, T, TextField } from '@/components/ui';
import { relativeTime } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors } from '@/theme';

/** Questions to bring to a pediatrician, health visitor or therapist. */
export default function ProfessionalQuestions() {
  const notes = useCollection(stores.pediatricianNotes);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    if (!text.trim()) return;
    setError(null);
    try {
      await notes.create({ text: text.trim(), createdAt: new Date().toISOString(), context: 'Development' }, 'add');
      setText('');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen back title="Questions to ask" subtitle="Write it down now, so it’s there at the appointment.">
      <TextField label="New question" placeholder="e.g. What kinds of tummy time work for us?" value={text} onChangeText={setText} multiline error={error ?? undefined} />
      <Button label="Save question" icon="plus" onPress={add} disabled={!text.trim()} loading={notes.isBusy('add')} />
      <Section title="Saved questions">
        <AsyncBlock
          status={notes.status}
          error={notes.error}
          onRetry={notes.retry}
          isEmpty={notes.items.length === 0}
          empty={<EmptyState icon="support" title="No questions yet" />}>
          {notes.items.map((n, i) => (
            <ListRow
              key={n.id}
              icon="support"
              iconTone={colors.sageWash}
              title={n.text}
              subtitle={[n.context, relativeTime(n.createdAt)].filter(Boolean).join(' · ')}
              last={i === notes.items.length - 1}
              right={<IconButton icon="trash" label="Remove question" tone="clear" onPress={() => notes.remove(n.id)} disabled={notes.isBusy(`remove:${n.id}`)} />}
            />
          ))}
        </AsyncBlock>
      </Section>
      <T variant="caption">This list stays on your device in the demo.</T>
    </Screen>
  );
}

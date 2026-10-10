import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AsyncBlock, Button, ChipRow, EmptyState, IconButton, ListRow, Notice, Screen, Section, T, TextField } from '@/components/ui';
import { dayLabel, shiftDays } from '@/lib/time';
import { stores, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { MilestoneType } from '@/types';

const TYPES: { value: MilestoneType; label: string }[] = [
  { value: 'social', label: 'Social' },
  { value: 'rolling', label: 'Rolling' },
  { value: 'sitting', label: 'Sitting' },
  { value: 'crawling', label: 'Crawling' },
  { value: 'standing', label: 'Standing' },
  { value: 'walking', label: 'Walking' },
  { value: 'first_word', label: 'First word' },
  { value: 'motor', label: 'Movement' },
  { value: 'other', label: 'Other' },
];
const typeLabel = (t: string) => TYPES.find((x) => x.value === t)?.label ?? t;

/** Moments you've noticed, in your own words. No deadlines, no checklists. */
export default function Milestones() {
  const milestones = useCollection(stores.milestones);
  const [type, setType] = useState<MilestoneType>('social');
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState(new Date().toISOString());
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setTouched(true);
    if (!title.trim()) return;
    setError(null);
    try {
      await milestones.create({ type, title: title.trim(), achievedAt: when, notes: notes.trim() || undefined }, 'create:milestone');
      setTitle('');
      setNotes('');
      setTouched(false);
      setWhen(new Date().toISOString());
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen back title="Milestones" subtitle="The moments you want to remember.">
      <Section title="Your notes">
        <AsyncBlock
          status={milestones.status}
          error={milestones.error}
          onRetry={milestones.retry}
          isEmpty={milestones.items.length === 0}
          empty={<EmptyState icon="sprout" title="Nothing noted yet" body="Add a moment below — a first laugh counts." />}>
          {milestones.items.map((m, i) => (
            <ListRow
              key={m.id}
              icon="sprout"
              iconTone={colors.sageWash}
              title={m.title}
              subtitle={[typeLabel(m.type), dayLabel(m.achievedAt), m.notes].filter(Boolean).join(' · ')}
              last={i === milestones.items.length - 1}
              right={<IconButton icon="trash" label={`Remove ${m.title}`} tone="clear" onPress={() => milestones.remove(m.id)} disabled={milestones.isBusy(`remove:${m.id}`)} />}
            />
          ))}
        </AsyncBlock>
      </Section>

      <Section title="Add a moment">
        <ChipRow label="Kind" value={type} onChange={setType} options={TYPES} />
        <TextField label="What happened" placeholder="e.g. Rolled from tummy to back" value={title} onChangeText={setTitle} maxLength={150} error={touched && !title.trim() ? 'Write a few words about it.' : undefined} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' }}>
          <T variant="smallStrong">When</T>
          <T style={{ flex: 1 }}>{dayLabel(when)}</T>
          <Button label="−1 day" size="sm" variant="secondary" onPress={() => setWhen(shiftDays(when, -1))} />
          <Button label="+1 day" size="sm" variant="secondary" onPress={() => setWhen(shiftDays(when, 1))} />
        </View>
        <TextField label="Note (optional)" value={notes} onChangeText={setNotes} multiline />
        {error ? (
          <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </T>
        ) : null}
        <Button label="Save moment" icon="plus" onPress={save} loading={milestones.isBusy('create:milestone')} />
      </Section>

      <Notice tone="sand" text="Every baby develops at their own pace. Nurture doesn’t judge timing or flag delays — if something’s on your mind, note it for your pediatrician." />
      <Button label="Questions for a professional" variant="secondary" icon="support" onPress={() => router.push('/development/questions')} />
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/icons';
import { FoodSearch } from '@/features/feeding/FoodSearch';
import { Button, Chip, goBack, ListRow, Panel, Screen, Section, T, TextField, TimeEditor } from '@/components/ui';
import { useFeedings } from '@/features/feeding/model';
import { dayLabel } from '@/lib/time';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { FeedingEntry } from '@/types';

type Solid = Extract<FeedingEntry, { kind: 'solid' }>;

/** Log a solid food. Nurture records what happened; it doesn't judge suitability or reactions. */
export default function BowlForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const feedings = useFeedings();
  const existing = id ? (feedings.items.find((f) => f.id === id && f.kind === 'solid') as Solid | undefined) : undefined;
  if (id && !existing && feedings.status !== 'ready') return <Screen sheet back title="Edit food">{null}</Screen>;
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing?: Solid }) {
  const feedings = useFeedings();
  const [food, setFood] = useState(existing?.food ?? '');
  const [at, setAt] = useState(existing?.at ?? new Date().toISOString());
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previous = useMemo(() => {
    const seen = new Map<string, Solid>();
    for (const s of feedings.solids) if (!seen.has(s.food.toLowerCase())) seen.set(s.food.toLowerCase(), s);
    return [...seen.values()];
  }, [feedings.solids]);

  const busyKey = existing ? `update:${existing.id}` : 'create:solid';
  const missing = !food.trim();

  const save = async () => {
    setTouched(true);
    if (missing) return;
    setError(null);
    const input = { kind: 'solid' as const, food: food.trim(), at, notes: notes.trim() || undefined };
    try {
      if (existing) await feedings.update(existing.id, input);
      else await feedings.create(input, busyKey);
      goBack('/kitchen');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!confirmDelete) return setConfirmDelete(true);
    try {
      await feedings.remove(existing.id);
      goBack('/kitchen/feeding');
    } catch (e) {
      setError(messageOf(e));
    }
  };

  return (
    <Screen sheet
      back
      title={existing ? 'Edit food' : 'Log a food'}
      subtitle="What was offered, and anything you noticed."
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label={existing ? 'Save changes' : 'Save food'} onPress={save} loading={feedings.isBusy(busyKey)} full size="lg" />
        </View>
      }>
      <View style={{ gap: space.xs }}>
        <TextField
          label="Food"
          placeholder="e.g. mashed avocado"
          value={food}
          onChangeText={setFood}
          onBlur={() => setTouched(true)}
          error={touched && missing ? 'Add the name of the food so you can find it later.' : undefined}
          autoCapitalize="sentences"
        />
        {!existing && previous.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
            {previous.slice(0, 5).map((p) => (
              <Chip key={p.id} label={p.food} selected={food === p.food} onPress={() => setFood(p.food)} />
            ))}
          </View>
        ) : null}
        {!existing ? <FoodSearch onPick={setFood} /> : null}
      </View>
      <TimeEditor label="Time" value={at} onChange={setAt} />
      <TextField label="How did it go? (optional)" placeholder="Curious, messy, not interested today…" value={notes} onChangeText={setNotes} multiline />

      <Panel tone="blue" style={{ flexDirection: 'row', gap: space.sm }}>
        <Icon name="info" color={colors.blueDeep} />
        <T variant="small" style={{ flex: 1, color: colors.blueDeep }}>
          Nurture can’t tell whether a food suits your baby or whether a reaction is an allergy. If you’re worried, contact your
          pediatrician — or your local emergency number if it feels urgent.
        </T>
      </Panel>

      {existing ? (
        <Button
          label={confirmDelete ? 'Tap again to remove this entry' : 'Remove entry'}
          icon="trash"
          variant="danger"
          onPress={remove}
          loading={feedings.isBusy(`remove:${existing.id}`)}
        />
      ) : null}

      <Section title="Foods logged before">
        {previous.length ? (
          previous.map((p, i) => (
            <ListRow key={p.id} icon="bowl" iconTone={colors.terracottaWash} title={p.food} subtitle={p.notes} meta={dayLabel(p.at)} last={i === previous.length - 1} />
          ))
        ) : (
          <T variant="small">Nothing yet. Foods you log will collect here.</T>
        )}
      </Section>
    </Screen>
  );
}

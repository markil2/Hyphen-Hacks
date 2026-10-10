import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, DemoBadge, EmptyState, IconButton, ListRow, LoadingState, Panel, Screen, Section, T, TextField } from '@/components/ui';
import { useSaved } from '@/features/saved/useSaved';
import { ConsultStatusPanel } from '@/features/support/ConsultStatus';
import { ExpertInitials, topicLabel } from '@/features/support/ExpertCard';
import { newId } from '@/services/mock/storage';
import { formatClock, slotLabel } from '@/lib/time';
import { stores, useCatalog, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { Consultation, ConsultMessage, ConsultationStatus } from '@/types';

/** Status, details and the follow-up thread for one request. */
export default function ConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const consultations = useCollection(stores.consultations);
  const experts = useCatalog(stores.experts);
  const saved = useSaved();
  const c = consultations.items.find((x) => x.id === id);
  const expert = experts.items.find((e) => e.id === c?.expertId);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!c || !expert) {
    return <Screen back>{consultations.status === 'ready' && experts.status === 'ready' ? <EmptyState title="Request not found" /> : <LoadingState />}</Screen>;
  }

  const busy = consultations.isBusy(`update:${c.id}`);
  const push = async (patch: Partial<Consultation>, messages: Omit<ConsultMessage, 'id' | 'at'>[]) => {
    setError(null);
    const at = new Date().toISOString();
    try {
      await consultations.update(c.id, { ...patch, messages: [...c.messages, ...messages.map((m) => ({ ...m, id: newId(), at }))] });
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const simulate = (status: ConsultationStatus) =>
    push(
      { status },
      status === 'confirmed'
        ? [
            { from: 'system', text: 'Demo control: marked as confirmed. In the real app this changes only when the expert accepts.' },
            { from: 'expert', text: `Sample reply: Thanks for reaching out. I’ve noted your question about ${topicLabel[c.topic].toLowerCase()} and we can talk it through at our time.` },
          ]
        : [{ from: 'system', text: 'Demo control: marked as unavailable.' }],
    );

  const send = async () => {
    if (!draft.trim()) return;
    await push({}, [{ from: 'parent', text: draft.trim() }]);
    setDraft('');
  };

  const open = c.status === 'pending' || c.status === 'confirmed';

  return (
    <Screen back title="Your request">
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <ExpertInitials expert={expert} size={48} />
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong">{expert.name}</T>
          <T variant="small">{expert.role}</T>
        </View>
        <DemoBadge label="Demo" />
      </View>

      <ConsultStatusPanel status={c.status} />

      <Panel>
        <ListRow title="Topic" meta={topicLabel[c.topic]} />
        <ListRow title="Time" meta={slotLabel(c.slot)} />
        <ListRow title="Note" subtitle={c.note || 'No note'} last />
      </Panel>

      {c.status === 'pending' ? (
        <Panel tone="blue">
          <T variant="smallStrong" style={{ color: colors.blueDeep }}>
            Demo controls
          </T>
          <T variant="small" style={{ color: colors.blueDeep }}>
            For presenting the flow only. These stand in for what an expert would do.
          </T>
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            <Button label="Simulate confirmation" size="sm" variant="secondary" onPress={() => simulate('confirmed')} loading={busy} />
            <Button label="Simulate unavailable" size="sm" variant="secondary" onPress={() => simulate('unavailable')} disabled={busy} />
          </View>
        </Panel>
      ) : null}

      <Section title="Conversation">
        <View style={{ gap: space.sm }}>
          {c.messages.map((m) => (
            <Message key={m.id} message={m} expertName={expert.name} saved={saved.isSaved(m.id)} onSave={() => saved.toggle({ kind: 'answer', refId: m.id, title: `${expert.name} (sample): ${m.text.slice(0, 60)}…` })} />
          ))}
        </View>
        {open ? (
          <View style={{ gap: space.xs }}>
            <TextField label="Add a follow-up" placeholder="Write a message" value={draft} onChangeText={setDraft} multiline />
            <Button label="Add to thread (not delivered)" variant="secondary" icon="send" onPress={send} disabled={!draft.trim()} loading={busy} />
          </View>
        ) : null}
        {error ? (
          <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </T>
        ) : null}
      </Section>

      {open ? <Button label="Cancel request" variant="danger" onPress={() => push({ status: 'cancelled' }, [{ from: 'system', text: 'You cancelled this request.' }])} disabled={busy} /> : null}
    </Screen>
  );
}

function Message({ message, expertName, saved, onSave }: { message: ConsultMessage; expertName: string; saved: boolean; onSave: () => void }) {
  if (message.from === 'system') {
    return (
      <T variant="caption" style={{ textAlign: 'center', paddingHorizontal: space.md }}>
        {message.text}
      </T>
    );
  }
  const mine = message.from === 'parent';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <T variant="caption" style={{ color: colors.ink2 }}>
        {mine ? 'You · not delivered (demo)' : `${expertName} · sample message`} · {formatClock(message.at)}
      </T>
      <T>{message.text}</T>
      {!mine ? (
        <View style={{ alignSelf: 'flex-end' }}>
          <IconButton icon="bookmark" label={saved ? 'Remove saved answer' : 'Save this answer'} tone="clear" size={40} color={saved ? colors.terracottaDeep : colors.ink2} onPress={onSave} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { padding: space.md, borderRadius: radius.lg, gap: 4, maxWidth: '92%' },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.warmWhite, borderBottomRightRadius: 6 },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.sageWash, borderBottomLeftRadius: 6 },
});

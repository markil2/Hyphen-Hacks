import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, DemoNotice, EmptyState, ListRow, LoadingState, Panel, Screen, T, TextField } from '@/components/ui';
import { ExpertInitials, topicLabel } from '@/features/support/ExpertCard';
import { newId } from '@/services/mock/storage';
import { slotLabel } from '@/lib/time';
import { stores, useCatalog, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { Expert, SupportTopic } from '@/types';

const methodLabel = { chat: 'Messages', video: 'Video call', phone: 'Phone call' } as const;

/** Request → pick a sample time → review → submit. Nothing is sent in the demo. */
export default function RequestConsultation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const experts = useCatalog(stores.experts);
  const expert = experts.items.find((e) => e.id === id);
  if (!expert) return <Screen back>{experts.status === 'ready' ? <EmptyState title="Profile not found" /> : <LoadingState />}</Screen>;
  return <Flow expert={expert} />;
}

function Flow({ expert }: { expert: Expert }) {
  const consultations = useCollection(stores.consultations);
  const [step, setStep] = useState<'details' | 'review'>('details');
  const [topic, setTopic] = useState<SupportTopic>(expert.topics[0]);
  const [method, setMethod] = useState(expert.contactMethods[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!slot) return;
    setError(null);
    try {
      const now = new Date().toISOString();
      const c = await consultations.create(
        {
          expertId: expert.id,
          slot,
          method,
          topic,
          note: note.trim(),
          status: 'pending',
          createdAt: now,
          messages: [
            {
              id: newId(),
              from: 'system',
              text: `Request recorded in the demo. Nothing has been sent to ${expert.name}, who is a fictional sample profile.`,
              at: now,
            },
          ],
        },
        'request',
      );
      router.replace({ pathname: '/support/consultation/[id]', params: { id: c.id } });
    } catch (e) {
      setError(messageOf(e));
    }
  };

  const header = (
    <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
      <ExpertInitials expert={expert} size={44} />
      <View>
        <T variant="bodyStrong">{expert.name}</T>
        <T variant="small">{expert.role} · sample profile</T>
      </View>
    </View>
  );

  if (step === 'review') {
    return (
      <Screen
        back={() => setStep('details')}
        title="Review request"
        footer={
          <View style={{ gap: space.xs }}>
            {error ? (
              <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
                {error}
              </T>
            ) : null}
            <Button label="Send request (demo)" onPress={submit} loading={consultations.isBusy('request')} size="lg" full />
          </View>
        }>
        {header}
        <Panel>
          <ListRow title="Topic" meta={topicLabel[topic]} />
          <ListRow title="How" meta={methodLabel[method]} />
          <ListRow title="When" meta={slot ? slotLabel(slot) : '—'} />
          <ListRow title="Your note" subtitle={note.trim() || 'No note'} last />
        </Panel>
        <DemoNotice>This is a demo: the request will be saved on this device only and will not reach anyone.</DemoNotice>
        <Button label="Change details" variant="secondary" onPress={() => setStep('details')} />
      </Screen>
    );
  }

  return (
    <Screen
      back
      title="Request a consultation"
      footer={<Button label="Review request" onPress={() => setStep('review')} disabled={!slot} size="lg" full accessibilityHint={slot ? undefined : 'Choose a time first'} />}>
      {header}
      <ChipRow label="Topic" value={topic} onChange={setTopic} options={expert.topics.map((t) => ({ value: t, label: topicLabel[t] }))} />
      <ChipRow label="How would you like to talk?" value={method} onChange={setMethod} options={expert.contactMethods.map((m) => ({ value: m, label: methodLabel[m] }))} />
      <View style={{ gap: 6 }}>
        <ChipRow label="Choose a sample time" value={slot} onChange={setSlot} options={expert.availability.map((s) => ({ value: s, label: slotLabel(s) }))} />
        <T variant="caption">Demo times only — not anyone’s real availability.</T>
      </View>
      <TextField label="Anything they should know? (optional)" placeholder="A sentence or two is plenty" value={note} onChangeText={setNote} multiline />
    </Screen>
  );
}

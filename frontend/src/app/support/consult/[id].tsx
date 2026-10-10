import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, ChipRow, EmptyState, LoadingState, Notice, Screen, T, TextField } from '@/components/ui';
import { ExpertInitials } from '@/features/support/ExpertCard';
import { remote } from '@/services';
import { stores, useCatalog } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

/** Write a consultation request. The backend stores it; it is not delivered to anyone yet. */
export default function RequestConsultation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const experts = useCatalog(stores.experts);
  const questions = useCatalog(stores.questions);
  const consultations = useCatalog(stores.consultations);
  const expert = experts.items.find((e) => e.id === id);
  const [message, setMessage] = useState('');
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!expert) return <Screen back>{experts.status === 'ready' ? <EmptyState title="Profile not found" /> : <LoadingState />}</Screen>;

  const tooShort = message.trim().length < 10;

  const submit = async () => {
    setTouched(true);
    if (tooShort || sending) return;
    setSending(true);
    setError(null);
    try {
      const { consultation, notice } = await remote.support.requestConsultation({
        expertId: expert.id,
        message: message.trim(),
        ...(questionId ? { questionId } : {}),
      });
      consultations.upsert(consultation);
      router.replace({ pathname: '/support/consultation/[id]', params: { id: consultation.id, notice } });
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen
      back
      title="Consultation request"
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Save request" onPress={submit} loading={sending} size="lg" full />
        </View>
      }>
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
        <ExpertInitials expert={expert} size={44} />
        <View style={{ flex: 1 }}>
          <T variant="bodyStrong">{expert.name}</T>
          <T variant="small">{expert.specialty}</T>
        </View>
      </View>
      <Notice tone="sand" text="Nurture can’t deliver requests to professionals yet. Your request is saved so you can see how this will work — no one will receive it." />
      <TextField
        label="What would you like help with?"
        placeholder="A few sentences is plenty"
        value={message}
        onChangeText={setMessage}
        multiline
        error={touched && tooShort ? 'Write at least a sentence (10 characters or more).' : undefined}
      />
      {questions.items.length ? (
        <ChipRow
          label="Link a question you asked (optional)"
          value={questionId}
          onChange={(v) => setQuestionId(v === questionId ? null : v)}
          options={questions.items.slice(0, 4).map((q) => ({ value: q.id, label: q.text.length > 38 ? `${q.text.slice(0, 36)}…` : q.text }))}
        />
      ) : null}
    </Screen>
  );
}

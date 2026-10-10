import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Button, ChipRow, DemoNotice, Panel, Screen, Section, T, TextField } from '@/components/ui';
import { ExpertCard, topicLabel } from '@/features/support/ExpertCard';
import { UrgentHelp } from '@/features/support/UrgentHelp';
import { stores, useCatalog, useCollection } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { Question, SupportTopic } from '@/types';

const TOPICS: SupportTopic[] = ['sleep', 'feeding', 'soothing', 'development', 'recovery', 'other'];

/** Ask in plain language. In the demo, the question is recorded on this device — never sent. */
export default function Ask() {
  const questions = useCollection(stores.questions);
  const experts = useCatalog(stores.experts);
  const [text, setText] = useState('');
  const [topic, setTopic] = useState<SupportTopic | null>(null);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<Question | null>(null);

  const tooShort = text.trim().length < 8;

  const submit = async () => {
    setTouched(true);
    if (tooShort || !topic) return;
    setError(null);
    try {
      const q = await questions.create({ text: text.trim(), topic, createdAt: new Date().toISOString(), status: 'recorded' }, 'ask');
      setRecorded(q);
    } catch (e) {
      setError(messageOf(e));
    }
  };

  if (recorded) {
    const matches = experts.items.filter((e) => e.topics.includes(recorded.topic));
    return (
      <Screen back title="Question recorded">
        <Animated.View entering={FadeIn.duration(260)} style={{ gap: space.lg }}>
          <Panel tone="white">
            <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
              <Icon name="check" color={colors.sageDeep} strokeWidth={2.2} />
              <T variant="smallStrong">Saved in the demo — not sent to anyone</T>
            </View>
            <T variant="lead">“{recorded.text}”</T>
            <T variant="caption">Topic: {topicLabel[recorded.topic]}</T>
          </Panel>
          <DemoNotice>
            When the backend is connected, this is where you’ll see that your question reached a real person. Until then nothing
            leaves this device.
          </DemoNotice>

          <Section title="Next steps">
            <T>
              {recorded.topic === 'other'
                ? 'People who help with general questions are listed below.'
                : `People who usually help with ${topicLabel[recorded.topic].toLowerCase()} questions are listed below.`}{' '}
              You can request a consultation with any of them.
            </T>
            {matches.length ? (
              matches.map((e) => <ExpertCard key={e.id} expert={e} onPress={() => router.push({ pathname: '/support/expert/[id]', params: { id: e.id } })} />)
            ) : (
              <T variant="small">No sample profiles match this topic yet.</T>
            )}
          </Section>

          <View style={{ gap: space.xs }}>
            <Button label="See all my questions" variant="secondary" onPress={() => router.replace('/support/questions')} />
            <Button
              label="Ask another question"
              variant="quiet"
              onPress={() => {
                setRecorded(null);
                setText('');
                setTopic(null);
                setTouched(false);
              }}
            />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen
      back
      title="Ask a question"
      subtitle="Use your own words. There are no silly questions."
      footer={
        <View style={{ gap: space.xs }}>
          {error ? (
            <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
              {error}
            </T>
          ) : null}
          <Button label="Record my question" onPress={submit} loading={questions.isBusy('ask')} size="lg" full />
        </View>
      }>
      <UrgentHelp />
      <TextField
        label="Your question"
        placeholder="e.g. Is it normal for feeds to be closer together in the evening?"
        value={text}
        onChangeText={setText}
        multiline
        error={touched && tooShort ? 'Add a little more detail so the right person can help.' : undefined}
      />
      <View style={{ gap: 6 }}>
        <ChipRow label="Topic" value={topic} onChange={setTopic} options={TOPICS.map((t) => ({ value: t, label: topicLabel[t] }))} />
        {touched && !topic ? (
          <T variant="small" style={{ color: colors.danger }}>
            Pick the closest topic — it helps match you with the right kind of expert.
          </T>
        ) : null}
      </View>
      <T variant="caption">
        Nurture connects you with people; it doesn’t diagnose. Any answer you receive is not a substitute for your own clinician.
      </T>
    </Screen>
  );
}

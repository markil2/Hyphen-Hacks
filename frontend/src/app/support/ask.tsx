import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { Button, ChipRow, LoadingState, Notice, Panel, Screen, Section, SourceLink, T, TextField } from '@/components/ui';
import { categoryLabel, ExpertCard } from '@/features/support/ExpertCard';
import { UrgentHelp } from '@/features/support/UrgentHelp';
import { remote } from '@/services';
import { stores, useCatalog } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';
import type { ExpertMatch, QuestionCategory, QuestionReceipt } from '@/types';

const CATEGORIES: QuestionCategory[] = ['sleep', 'feeding', 'development', 'health', 'general'];

/** Ask in plain language. The question is saved to Nurture and matched to kinds of professionals. */
export default function Ask() {
  const questions = useCatalog(stores.questions);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<QuestionReceipt | null>(null);
  const [match, setMatch] = useState<ExpertMatch | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const tooShort = text.trim().length < 10;

  const loadMatch = async (questionId: string) => {
    setMatchError(null);
    try {
      setMatch(await remote.support.match(questionId));
    } catch (e) {
      setMatchError(messageOf(e));
    }
  };

  const submit = async () => {
    setTouched(true);
    if (tooShort || !category || sending) return;
    setSending(true);
    setError(null);
    try {
      const r = await remote.support.ask(text.trim(), category);
      questions.upsert(r.question);
      setReceipt(r);
      loadMatch(r.question.id);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSending(false);
    }
  };

  if (receipt) {
    return (
      <Screen back title="Question saved">
        <Animated.View entering={FadeIn.duration(260)} style={{ gap: space.lg }}>
          {receipt.mayBeUrgent ? <Notice tone="danger" icon="alert" text={receipt.safetyNotice} /> : null}
          <Panel tone="white">
            <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
              <Icon name="check" color={colors.sageDeep} strokeWidth={2.2} />
              <T variant="smallStrong">Saved to Nurture — not sent to a professional</T>
            </View>
            <T variant="lead">“{receipt.question.text}”</T>
            <T variant="caption">Topic: {categoryLabel[receipt.question.category]}</T>
          </Panel>
          {!receipt.mayBeUrgent ? <Notice tone="sand" text={receipt.safetyNotice} /> : null}

          <Section title="Who usually helps with this">
            {matchError ? (
              <View style={{ gap: space.xs }}>
                <T variant="small" style={{ color: colors.danger }}>
                  {matchError}
                </T>
                <Button label="Try again" size="sm" variant="secondary" onPress={() => loadMatch(receipt.question.id)} />
              </View>
            ) : !match ? (
              <LoadingState label="Finding the right kinds of support" />
            ) : (
              <>
                <T variant="small">Suggested: {match.recommendedSpecialties.join(', ')}. This is simple topic matching, not a diagnosis.</T>
                {match.experts.map((e) => (
                  <ExpertCard key={e.id} expert={e} onPress={() => router.push({ pathname: '/support/expert/[id]', params: { id: e.id } })} />
                ))}
                {match.resources.length ? (
                  <View style={{ gap: space.xs, marginTop: space.sm }}>
                    <T variant="smallStrong">Reading from trusted sources</T>
                    {match.resources.map((r) => (
                      <View key={r.id} style={{ gap: 2 }}>
                        <T variant="bodyStrong">{r.title}</T>
                        <SourceLink url={r.sourceUrl} label={r.sourceName} />
                      </View>
                    ))}
                  </View>
                ) : null}
              </>
            )}
          </Section>

          <View style={{ gap: space.xs }}>
            <Button label="See all my questions" variant="secondary" onPress={() => router.replace('/support/questions')} />
            <Button
              label="Ask another question"
              variant="quiet"
              onPress={() => {
                setReceipt(null);
                setMatch(null);
                setText('');
                setCategory(null);
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
          <Button label="Save my question" onPress={submit} loading={sending} size="lg" full />
        </View>
      }>
      <UrgentHelp />
      <TextField
        label="Your question"
        placeholder="e.g. Is it normal for feeds to be closer together in the evening?"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={3000}
        error={touched && tooShort ? 'Add a little more detail (at least 10 characters).' : undefined}
      />
      <View style={{ gap: 6 }}>
        <ChipRow label="Topic" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel[c] }))} />
        {touched && !category ? (
          <T variant="small" style={{ color: colors.danger }}>
            Pick the closest topic — it decides which kinds of professionals are suggested.
          </T>
        ) : null}
      </View>
      <T variant="caption">Nurture suggests kinds of support; it doesn’t diagnose, and your question isn’t sent to anyone yet.</T>
    </Screen>
  );
}

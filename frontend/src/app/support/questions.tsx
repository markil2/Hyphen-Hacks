import { router } from 'expo-router';

import { AsyncBlock, Button, EmptyState, IconButton, ListRow, Screen, Section } from '@/components/ui';
import { useSaved } from '@/features/saved/useSaved';
import { statusCopy } from '@/features/support/ConsultStatus';
import { topicLabel } from '@/features/support/ExpertCard';
import { relativeTime, slotLabel } from '@/lib/time';
import { stores, useCatalog, useCollection } from '@/state';
import { colors } from '@/theme';

/** The bookshelf: everything a parent has asked, requested or kept. */
export default function MyQuestions() {
  const questions = useCollection(stores.questions);
  const consultations = useCollection(stores.consultations);
  const experts = useCatalog(stores.experts);
  const answers = useSaved('answer');

  return (
    <Screen back title="My questions" subtitle="Questions, requests and answers you kept.">
      <Button label="Ask a new question" icon="plus" onPress={() => router.push('/support/ask')} />

      <Section title="Questions">
        <AsyncBlock
          status={questions.status}
          error={questions.error}
          onRetry={questions.retry}
          isEmpty={questions.items.length === 0}
          empty={<EmptyState icon="support" title="No questions yet" body="Questions you ask will be listed here." />}>
          {questions.items.map((q, i) => (
            <ListRow
              key={q.id}
              icon="support"
              iconTone={colors.sageWash}
              title={q.text}
              subtitle={`${topicLabel[q.topic]} · ${q.status === 'recorded' ? 'Recorded in demo, not sent' : q.status} · ${relativeTime(q.createdAt)}`}
              last={i === questions.items.length - 1}
              right={<IconButton icon="trash" label="Remove question" tone="clear" onPress={() => questions.remove(q.id)} disabled={questions.isBusy(`remove:${q.id}`)} />}
            />
          ))}
        </AsyncBlock>
      </Section>

      <Section title="Consultation requests">
        <AsyncBlock
          status={consultations.status}
          error={consultations.error}
          onRetry={consultations.retry}
          isEmpty={consultations.items.length === 0}
          empty={<EmptyState icon="calendar" title="No requests yet" body="Find an expert and request a time to see it here." action={{ label: 'Find an expert', onPress: () => router.push('/support/experts') }} />}>
          {consultations.items.map((c, i) => {
            const e = experts.items.find((x) => x.id === c.expertId);
            return (
              <ListRow
                key={c.id}
                icon="calendar"
                iconTone={colors.blueWash}
                title={e?.name ?? 'Expert'}
                subtitle={`${statusCopy[c.status].label} · ${slotLabel(c.slot)}`}
                onPress={() => router.push({ pathname: '/support/consultation/[id]', params: { id: c.id } })}
                last={i === consultations.items.length - 1}
              />
            );
          })}
        </AsyncBlock>
      </Section>

      <Section title="Saved answers">
        {answers.items.length ? (
          answers.items.map((a, i) => (
            <ListRow
              key={a.id}
              icon="bookmark"
              title={a.title}
              last={i === answers.items.length - 1}
              right={<IconButton icon="trash" label="Remove saved answer" tone="clear" onPress={() => answers.remove(a.id)} />}
            />
          ))
        ) : (
          <EmptyState icon="bookmark" title="Nothing saved yet" body="Tap the bookmark on a reply in a conversation to keep it here." />
        )}
      </Section>
    </Screen>
  );
}

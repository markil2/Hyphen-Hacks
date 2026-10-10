import { router } from 'expo-router';

import { AsyncBlock, Button, EmptyState, ListRow, Screen, Section } from '@/components/ui';
import { statusCopy } from '@/features/support/ConsultStatus';
import { categoryLabel } from '@/features/support/ExpertCard';
import { relativeTime } from '@/lib/time';
import { stores, useCatalog } from '@/state';
import { colors } from '@/theme';

/** The bookshelf: everything a parent has asked or requested. */
export default function MyQuestions() {
  const questions = useCatalog(stores.questions);
  const consultations = useCatalog(stores.consultations);

  return (
    <Screen back title="My questions" subtitle="What you’ve asked, and requests you’ve saved.">
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
              subtitle={`${categoryLabel[q.category] ?? q.category} · saved, not sent · ${relativeTime(q.createdAt)}`}
              last={i === questions.items.length - 1}
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
          empty={<EmptyState icon="calendar" title="No requests yet" body="Open a profile in the directory to write one." action={{ label: 'Find an expert', onPress: () => router.push('/support/experts') }} />}>
          {consultations.items.map((c, i) => (
            <ListRow
              key={c.id}
              icon="calendar"
              iconTone={colors.blueWash}
              title={c.expertName ?? 'Consultation request'}
              subtitle={`${statusCopy[c.status]?.label ?? c.status} · ${relativeTime(c.createdAt)}`}
              onPress={() => router.push({ pathname: '/support/consultation/[id]', params: { id: c.id } })}
              last={i === consultations.items.length - 1}
            />
          ))}
        </AsyncBlock>
      </Section>
    </Screen>
  );
}

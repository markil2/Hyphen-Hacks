import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AsyncBlock, Button, DemoNotice, EmptyState, Screen, T, VerificationBadge } from '@/components/ui';
import { ageInMonths } from '@/lib/time';
import { stores, useCatalog, useDoc } from '@/state';
import { colors, radius, space } from '@/theme';

/** A loose timeline of things many babies do — never deadlines, never a diagnosis. */
export default function Milestones() {
  const milestones = useCatalog(stores.milestones);
  const baby = useDoc(stores.profile).value?.baby;
  const months = baby ? ageInMonths(baby.birthDate) : null;

  return (
    <Screen back title="Milestones" subtitle="A loose map of things many babies do, in their own time.">
      <DemoNotice>
        Sample content, not yet reviewed or sourced. Ranges overlap widely, and a baby doing things earlier or later isn’t, on its
        own, something this app can interpret.
      </DemoNotice>
      <AsyncBlock status={milestones.status} error={milestones.error} onRetry={milestones.retry} isEmpty={milestones.items.length === 0} empty={<EmptyState title="No milestones yet" />}>
        <View>
          {milestones.items.map((m, i) => {
            const here = months !== null && months >= m.monthsFrom && months < m.monthsTo;
            return (
              <View key={m.id} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.dot, here && styles.dotHere]} />
                  {i < milestones.items.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={[styles.body, here && styles.bodyHere]}>
                  <T variant="caption">
                    {m.ageLabel}
                    {here ? ' · around now' : ''}
                  </T>
                  <T variant="heading">{m.title}</T>
                  {m.examples.map((ex) => (
                    <T key={ex} variant="small">
                      {ex}
                    </T>
                  ))}
                  <VerificationBadge verification={m.verification} />
                </View>
              </View>
            );
          })}
        </View>
      </AsyncBlock>
      <T variant="small">If something is on your mind, write it down and bring it to your pediatrician or health visitor.</T>
      <Button label="Save a question for a professional" variant="secondary" icon="plus" onPress={() => router.push('/development/questions')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.sageDeep, backgroundColor: colors.cream, marginTop: 18 },
  dotHere: { backgroundColor: colors.sageDeep },
  line: { flex: 1, width: 2, backgroundColor: colors.lineStrong, marginTop: 4 },
  body: { flex: 1, gap: 4, paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.lg, marginBottom: space.sm },
  bodyHere: { backgroundColor: colors.warmWhite },
});

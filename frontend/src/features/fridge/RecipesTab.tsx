import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Button, Notice, Panel, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { remote } from '@/services';
import { messageOf } from '@/state/store';
import { colors, radius, space } from '@/theme';
import type { RecipeIdea, RecipeIdeas } from '@/types';

/** Meal ideas for the week, suggested from what's been logged (never from the values themselves). */
export function RecipesTab() {
  const [data, setData] = useState<RecipeIdeas | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      setData(await remote.ai.recipeIdeas());
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  const based = data
    ? [
        data.basedOn.stage === 'not set up' ? null : data.basedOn.stage === 'cycle' ? 'cycle tracking' : data.basedOn.stage,
        data.basedOn.breastfeeding ? 'breastfeeding' : null,
        data.basedOn.hormonesLogged.length ? `${data.basedOn.hormonesLogged.join(', ')} logged recently` : null,
      ].filter(Boolean)
    : [];

  return (
    <>
      <Panel tone="white">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          <Icon name="leaf" color={colors.sageDeep} />
          <T variant="bodyStrong" style={{ flex: 1 }}>
            Easy meals for this week
          </T>
        </View>
        <T variant="small">Ideas chosen around what you’ve been logging: your stage, feeding, and the hormones you track. Your numbers are never read or judged.</T>
        <Button label={data ? 'New ideas' : 'Get recipe ideas'} icon="sparkle" onPress={load} loading={busy} />
      </Panel>

      {error ? (
        <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          {error}
        </T>
      ) : null}

      {data ? (
        <>
          <T variant="caption">
            {data.source === 'ai' ? 'Suggested by AI' : 'From the Nurture recipe box'}
            {based.length ? ` · based on ${based.join(' · ')}` : ''}
          </T>
          {data.ideas.map((idea) => (
            <RecipeCard key={idea.title} idea={idea} />
          ))}
          <Notice tone="sand" text={data.notice} />
        </>
      ) : null}
    </>
  );
}

function RecipeCard({ idea }: { idea: RecipeIdea }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${idea.title}, ${idea.minutes} minutes`}
        onPress={() => {
          haptic.tap();
          setOpen((o) => !o);
        }}
        style={styles.head}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="bodyStrong">{idea.title}</T>
          <T variant="small">{idea.why}</T>
        </View>
        <View style={styles.time}>
          <Icon name="clock" size={14} color={colors.ink2} />
          <T variant="smallStrong">{idea.minutes} min</T>
        </View>
        <Icon name={open ? 'up' : 'down'} size={16} color={colors.ink3} />
      </Pressable>
      {open ? (
        <View style={{ gap: space.xs }}>
          <T variant="smallStrong">You’ll need</T>
          {idea.ingredients.map((x) => (
            <T key={x} variant="small">
              • {x}
            </T>
          ))}
          <T variant="smallStrong" style={{ marginTop: space.xxs }}>
            Steps
          </T>
          {idea.steps.map((x, i) => (
            <T key={x} variant="small">
              {i + 1}. {x}
            </T>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: space.md, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

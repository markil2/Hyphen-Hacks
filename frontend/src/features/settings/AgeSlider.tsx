import Slider from '@react-native-community/slider';
import { useState } from 'react';

import { Panel, Section, T } from '@/components/ui';
import { ageInMonths, birthDateForMonths } from '@/lib/age';
import { stores, useDoc } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

/**
 * Demo control: slide the baby's age to show how the house changes as they grow
 * (for example, the solids bowl appears at 6 months). It updates the birth date.
 */
export function AgeSlider() {
  const baby = useDoc(stores.baby);
  const current = baby.value ? ageInMonths(baby.value.birthDate) : 0;
  const [preview, setPreview] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const months = preview ?? current;

  const commit = async (m: number) => {
    if (!baby.value) return;
    setError(null);
    try {
      await baby.save({ ...baby.value, birthDate: birthDateForMonths(Math.round(m)) });
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setPreview(null);
    }
  };

  return (
    <Section title="Baby’s age (demo)">
      <Panel tone="white">
        <T variant="heading">{months === 0 ? 'Newborn' : `${months} month${months === 1 ? '' : 's'}`}</T>
        <Slider
          accessibilityLabel="Baby’s age in months"
          minimumValue={0}
          maximumValue={36}
          step={1}
          value={current}
          disabled={!baby.value || baby.saving}
          onValueChange={(v) => setPreview(Math.round(v))}
          onSlidingComplete={commit}
          minimumTrackTintColor={colors.charcoal}
          maximumTrackTintColor={colors.lineStrong}
          style={{ marginHorizontal: -space.xxs }}
        />
        <T variant="small">Changes the birth date so you can show how the rooms grow with the baby.</T>
        {error ? (
          <T variant="small" style={{ color: colors.danger }}>
            {error}
          </T>
        ) : null}
      </Panel>
    </Section>
  );
}

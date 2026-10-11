import { router } from 'expo-router';

import { Screen } from '@/components/ui';
import { MomTab } from '@/features/mom/MomTracking';

/** The mirror: a moment for the parent. Hormones and everyday measurements, kept exactly as entered. */
export default function MomCorner() {
  return (
    <Screen back title="For you" subtitle="Your own tracking: hormones and everyday measurements.">
      <MomTab onRecipes={() => router.push({ pathname: '/kitchen/fridge', params: { tab: 'recipes' } })} />
    </Screen>
  );
}

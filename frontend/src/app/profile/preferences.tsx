import { View } from 'react-native';

import { Chip, LoadingState, Screen, Section, T } from '@/components/ui';
import { topicLabel } from '@/features/support/ExpertCard';
import { useProfile } from '@/features/profile/useProfile';
import { space } from '@/theme';
import type { Preferences, SupportTopic } from '@/types';

const TOPICS: SupportTopic[] = ['sleep', 'feeding', 'soothing', 'development', 'recovery'];
const METHODS: { value: Preferences['contactMethods'][number]; label: string }[] = [
  { value: 'chat', label: 'Messages' },
  { value: 'video', label: 'Video call' },
  { value: 'phone', label: 'Phone call' },
];

export default function SupportPreferences() {
  const { profile, setPreference, saving } = useProfile();
  if (!profile) return <Screen back title="Support preferences"><LoadingState /></Screen>;
  const p = profile.preferences;
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Screen back title="Support preferences" subtitle="Helps us suggest the right people first.">
      <Section title="Topics you’d like help with">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          {TOPICS.map((t) => (
            <Chip key={t} label={topicLabel[t]} selected={p.supportTopics.includes(t)} onPress={() => setPreference('supportTopics', toggle(p.supportTopics, t))} />
          ))}
        </View>
      </Section>
      <Section title="How you like to talk">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
          {METHODS.map((m) => (
            <Chip key={m.value} label={m.label} selected={p.contactMethods.includes(m.value)} onPress={() => setPreference('contactMethods', toggle(p.contactMethods, m.value))} />
          ))}
        </View>
      </Section>
      <T variant="caption" accessibilityLiveRegion="polite">
        {saving ? 'Saving…' : 'Changes save automatically on this device.'}
      </T>
    </Screen>
  );
}

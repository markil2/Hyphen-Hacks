import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { Button, DemoBadge, EmptyState, LoadingState, Panel, Screen, Section, SourceList, T, VerificationBadge } from '@/components/ui';
import { ExpertInitials, topicLabel } from '@/features/support/ExpertCard';
import { slotLabel } from '@/lib/time';
import { stores, useCatalog } from '@/state';
import { colors, space } from '@/theme';

const methodInfo: Record<'chat' | 'video' | 'phone', { label: string; icon: IconName }> = {
  chat: { label: 'Messages', icon: 'chat' },
  video: { label: 'Video call', icon: 'video' },
  phone: { label: 'Phone call', icon: 'call' },
};

export default function ExpertProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const experts = useCatalog(stores.experts);
  const expert = experts.items.find((e) => e.id === id);

  if (!expert) {
    return <Screen back>{experts.status === 'ready' ? <EmptyState title="Profile not found" /> : <LoadingState />}</Screen>;
  }

  const available = expert.availability.length > 0;

  return (
    <Screen
      back
      footer={
        <Button
          label={available ? 'Request a consultation' : 'Not taking requests'}
          onPress={() => router.push({ pathname: '/support/consult/[id]', params: { id: expert.id } })}
          disabled={!available}
          size="lg"
          full
        />
      }>
      <View style={{ alignItems: 'flex-start', gap: space.sm }}>
        <ExpertInitials expert={expert} size={84} />
        <View style={{ gap: 2 }}>
          <T variant="hero" accessibilityRole="header">
            {expert.name}
          </T>
          <T variant="lead">{expert.role}</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <DemoBadge origin={expert.origin} label="Sample profile · fictional" />
          <VerificationBadge verification={expert.verification} />
        </View>
      </View>

      <T>{expert.bio}</T>

      <Section title="Focus">
        <T variant="bodyStrong">{expert.specialty}</T>
        <T variant="small">Topics: {expert.topics.map((t) => topicLabel[t]).join(', ')}</T>
      </Section>

      <Section title="Credentials">
        <Panel>
          <T>{expert.credentials}</T>
          <SourceList verification={expert.verification} />
        </Panel>
      </Section>

      <Section title="Ways to connect">
        <View style={{ gap: space.xs }}>
          {expert.contactMethods.map((m) => (
            <View key={m} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <Icon name={methodInfo[m].icon} color={colors.ink2} />
              <T>{methodInfo[m].label}</T>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Sample availability">
        {available ? (
          <View style={{ gap: 4 }}>
            {expert.availability.map((s) => (
              <T key={s} variant="small">
                {slotLabel(s)}
              </T>
            ))}
            <T variant="caption">Example times for the demo. They don’t reflect anyone’s real calendar.</T>
          </View>
        ) : (
          <T variant="small">This sample profile shows how someone who isn’t taking new requests would appear.</T>
        )}
      </Section>
    </Screen>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';

import { IconName } from '@/components/icons';
import { Button, EmptyState, ErrorState, LoadingState, Notice, Panel, Screen, Section, SourceLink, StatusBadge, T } from '@/components/ui';
import { ExpertInitials, serviceLabel } from '@/features/support/ExpertCard';
import { remote } from '@/services';
import { messageOf } from '@/state/store';
import { space } from '@/theme';
import type { ContactOptions, Expert } from '@/types';

const AUDIENCE: Record<string, string> = { parent: 'Parents', baby_child: 'Babies & children', family: 'Whole family' };
const CONTACT: Record<'phone' | 'email' | 'website', { label: string; icon: IconName; href: (v: string) => string }> = {
  phone: { label: 'Call', icon: 'call', href: (v) => `tel:${v.replace(/[^\d+]/g, '')}` },
  email: { label: 'Email', icon: 'mail', href: (v) => `mailto:${v}` },
  website: { label: 'Website', icon: 'link', href: (v) => v },
};

export default function ExpertProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [notice, setNotice] = useState('');
  const [contact, setContact] = useState<ContactOptions | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string>();

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.all([remote.support.expertDetail(id), remote.support.contactOptions(id)]).then(
      ([detail, options]) => {
        if (!live) return;
        setExpert(detail.expert);
        setNotice(detail.notice);
        setContact(options);
        setStatus('ready');
      },
      (e) => {
        if (!live) return;
        setError(messageOf(e));
        setStatus('error');
      },
    );
    return () => {
      live = false;
    };
  }, [id, attempt]);
  const retry = () => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  };

  if (status === 'loading') return <Screen back><LoadingState label="Loading profile" /></Screen>;
  if (status === 'error' || !expert) {
    return <Screen back>{error ? <ErrorState message={error} onRetry={retry} /> : <EmptyState title="Profile not found" />}</Screen>;
  }

  return (
    <Screen back>
      <View style={{ alignItems: 'flex-start', gap: space.sm }}>
        <ExpertInitials expert={expert} size={80} />
        <View style={{ gap: 2 }}>
          <T variant="hero" accessibilityRole="header">
            {expert.name}
          </T>
          <T variant="lead">{expert.specialty}</T>
          {expert.organization && expert.organization !== expert.name ? <T variant="small">{expert.organization}</T> : null}
        </View>
        <StatusBadge status={expert.isDemo ? 'demo_not_verified' : expert.verificationStatus} />
      </View>

      {notice ? <Notice tone="sand" text={notice} /> : null}

      <T>{expert.description}</T>

      <Section title="About this listing">
        <Panel>
          <T variant="small">Service: {serviceLabel(expert.serviceCategory)}</T>
          <T variant="small">For: {AUDIENCE[expert.audience] ?? expert.audience}</T>
          <T variant="smallStrong">Credentials, as listed</T>
          <T variant="small">{expert.credentials}</T>
          <SourceLink url={expert.sourceUrl} label={expert.sourceUrl ? 'Where this information comes from' : undefined} />
        </Panel>
      </Section>

      {contact?.options.length ? (
        <Section title="Contact">
          <View style={{ gap: space.xs }}>
            {contact.options.map((o) => (
              <Button
                key={o.type}
                label={`${CONTACT[o.type].label} · ${o.type === 'website' ? o.value.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : o.value}`}
                icon={CONTACT[o.type].icon}
                variant="secondary"
                onPress={() => Linking.openURL(CONTACT[o.type].href(o.value)).catch(() => {})}
                accessibilityHint="Opens outside Nurture"
              />
            ))}
          </View>
          <T variant="caption">{contact.notice}</T>
        </Section>
      ) : null}

      {expert.isDemo ? (
        <Section title="Consultation request">
          <T variant="small">This is a fictional profile, so a request is only saved in Nurture to show how the flow will work. It isn’t sent to anyone.</T>
          <Button label="Write a request" icon="edit" onPress={() => router.push({ pathname: '/support/consult/[id]', params: { id: expert.id } })} />
        </Section>
      ) : null}
    </Screen>
  );
}

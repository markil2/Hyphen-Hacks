import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, DemoBadge, ErrorState, ListRow, LoadingState, Panel, Section, T, ToggleRow } from '@/components/ui';
import { BabyAvatar } from '@/features/profile/BabyAvatar';
import { useProfile } from '@/features/profile/useProfile';
import { babyAge } from '@/lib/time';
import { dataMode } from '@/services';
import { demoFlags } from '@/services/mock/storage';
import { restoreSampleData } from '@/state';
import { colors, space } from '@/theme';

export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { profile, status, error, retry, setPreference } = useProfile();
  const [failArmed, setFailArmed] = useState(false);
  const [restoring, setRestoring] = useState(false);

  return (
    <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: space.xxl, paddingHorizontal: space.lg - 4, gap: space.lg }}>
      <T variant="hero" accessibilityRole="header">
        Profile
      </T>

      {status === 'error' ? <ErrorState message={error} onRetry={retry} /> : null}
      {!profile ? (
        status !== 'error' ? <LoadingState label="Loading profile" /> : null
      ) : (
        <>
          <Panel tone="white" style={{ padding: space.lg - 4 }}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <BabyAvatar size={64} />
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="title">{profile.baby.name}</T>
                <T variant="small">{babyAge(profile.baby.birthDate)}</T>
                <T variant="small">
                  Parent: {profile.parent.name}
                  {profile.partnerName ? ` · with ${profile.partnerName}` : ''}
                </T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <DemoBadge origin={profile.origin} label="Sample profile" />
              <Button label="Edit details" icon="edit" size="sm" variant="secondary" onPress={() => router.push('/profile/edit')} />
            </View>
          </Panel>

          <Section title="Your things">
            <View>
              <ListRow icon="bookmark" title="Saved" subtitle="Products, answers, activities and posts" onPress={() => router.push('/profile/saved')} />
              <ListRow icon="history" title="Sleep & feeding history" onPress={() => router.push('/profile/history')} />
              <ListRow icon="support" title="Family & support preferences" subtitle="Topics, contact methods" onPress={() => router.push('/profile/preferences')} last />
            </View>
          </Section>

          <Section title="Notifications">
            <T variant="caption">Preferences only — the demo doesn’t send notifications.</T>
            <ToggleRow label="Feeding reminders" value={profile.preferences.notifyFeedingReminders} onChange={(v) => setPreference('notifyFeedingReminders', v)} />
            <ToggleRow label="Consultation updates" value={profile.preferences.notifyConsultUpdates} onChange={(v) => setPreference('notifyConsultUpdates', v)} />
            <ToggleRow label="Community replies" value={profile.preferences.notifyCommunityReplies} onChange={(v) => setPreference('notifyCommunityReplies', v)} />
          </Section>

          <Section title="Privacy">
            <ToggleRow label="Share logs with my partner" description="Applies once family accounts are connected." value={profile.preferences.shareWithPartner} onChange={(v) => setPreference('shareWithPartner', v)} />
            <ToggleRow label="Show my name in the community" description="Off means posts appear without your name." value={profile.preferences.showInCommunity} onChange={(v) => setPreference('showInCommunity', v)} />
          </Section>

          <Section title="Comfort">
            <ToggleRow label="Reduce motion" description="Replaces camera zooms and swaying with simple fades." value={profile.preferences.reduceMotion} onChange={(v) => setPreference('reduceMotion', v)} />
          </Section>

          <Section title="Help & safety">
            <ListRow icon="shield" title="Help & safety information" subtitle="When to call someone, how Nurture handles data" onPress={() => router.push('/profile/safety')} last />
          </Section>

          {dataMode === 'demo' ? (
            <Section title="Demo tools">
              <Panel tone="blue">
                <T variant="small" style={{ color: colors.blueDeep }}>
                  You’re in demo mode. Everything is sample data stored on this device; nothing is sent to a server.
                </T>
                <Button
                  label={failArmed ? 'Next request will fail' : 'Simulate a connection error'}
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    demoFlags.failNextRequest = !failArmed;
                    setFailArmed(!failArmed);
                  }}
                  accessibilityHint="Makes the next save or load fail so error states can be shown"
                />
                <Button
                  label="Restore sample data"
                  size="sm"
                  variant="secondary"
                  loading={restoring}
                  onPress={async () => {
                    setRestoring(true);
                    await restoreSampleData();
                    setRestoring(false);
                  }}
                />
              </Panel>
            </Section>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

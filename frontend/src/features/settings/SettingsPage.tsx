import { router } from 'expo-router';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { Button, ErrorState, ListRow, LoadingState, Panel, Section, T, ToggleRow } from '@/components/ui';
import { usePager } from '@/features/navigation/PagerContext';
import { BabyAvatar } from '@/features/profile/BabyAvatar';
import { haptic } from '@/lib/haptics';
import { babyAge } from '@/lib/time';
import { apiUrl, dataMode, remote } from '@/services';
import { demoFlags } from '@/services/mock/storage';
import { restoreSampleData, stores, useDoc } from '@/state';
import { messageOf } from '@/state/store';
import { colors, fonts, space } from '@/theme';
import type { Preferences } from '@/types';

/** Settings sit below the rooms: the baby's details, preferences, and where data lives. */
export function SettingsPage() {
  const insets = useSafeAreaInsets();
  const pager = usePager();
  const baby = useDoc(stores.baby);
  const account = useDoc(stores.account);
  const prefs = useDoc(stores.preferences);
  const [health, setHealth] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [failArmed, setFailArmed] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const setPref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => prefs.value && prefs.save({ ...prefs.value, [key]: value });

  // Dragging down past the top returns to the rooms.
  const onEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y < -70) pager.goTo('rooms');
  };

  const check = async () => {
    setChecking(true);
    try {
      const h = await remote.health();
      setHealth(dataMode === 'api' ? `Connected · demo login ${h.demoMode ? 'on' : 'off'}` : 'Offline demo (no server configured)');
    } catch (e) {
      setHealth(messageOf(e));
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.cream }}
      onScrollEndDrag={onEndDrag}
      contentContainerStyle={{ paddingTop: insets.top + space.xs, paddingBottom: insets.bottom + space.xxl, paddingHorizontal: space.lg - 4, gap: space.lg }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back up to the rooms"
        accessibilityHint="You can also drag down past the top"
        onPress={() => {
          haptic.tap();
          pager.goTo('rooms');
        }}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
        <Icon name="up" size={16} color={colors.ink2} strokeWidth={2} />
        <T style={styles.backText}>Back to the rooms</T>
      </Pressable>

      <T variant="hero" accessibilityRole="header">
        Settings & more
      </T>

      {baby.status === 'error' ? <ErrorState message={baby.error} onRetry={baby.retry} /> : null}
      {baby.value ? (
        <Panel tone="white" style={{ padding: space.lg - 4 }}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
            <BabyAvatar size={60} />
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="title">{baby.value.name}</T>
              <T variant="small">{babyAge(baby.value.birthDate)}</T>
              {account.value ? <T variant="small">Signed in as {account.value.name}</T> : null}
            </View>
          </View>
          <Button label="Edit baby’s details" icon="edit" size="sm" variant="secondary" onPress={() => router.push('/settings/baby')} style={{ alignSelf: 'flex-start' }} />
        </Panel>
      ) : baby.status !== 'error' ? (
        <LoadingState label="Loading profile" />
      ) : null}

      <Section title="Your things">
        <View>
          <ListRow icon="history" title="Sleep & feeding history" onPress={() => router.push('/settings/history')} />
          <ListRow icon="support" title="Questions & requests" subtitle="What you’ve asked and requested" onPress={() => router.push('/support/questions')} />
          <ListRow icon="bookmark" title="Saved" subtitle="Kept on this phone" onPress={() => router.push('/settings/saved')} last />
        </View>
      </Section>

      <Section title="Comfort">
        <ToggleRow
          label="Reduce motion"
          description="Swaps camera zooms and sliding for simple fades. Your phone’s setting is also respected."
          value={Boolean(prefs.value?.reduceMotion)}
          onChange={(v) => setPref('reduceMotion', v)}
        />
      </Section>

      <Section title="Notifications">
        <T variant="caption">Saved on this phone. Nurture doesn’t send notifications yet.</T>
        <ToggleRow label="Feeding reminders" value={Boolean(prefs.value?.notifyFeedingReminders)} onChange={(v) => setPref('notifyFeedingReminders', v)} />
        <ToggleRow label="Consultation updates" value={Boolean(prefs.value?.notifyConsultUpdates)} onChange={(v) => setPref('notifyConsultUpdates', v)} />
      </Section>

      <Section title="Help & safety">
        <ListRow icon="shield" title="When to call someone, and how Nurture handles data" onPress={() => router.push('/settings/safety')} last />
      </Section>

      <Section title="Connection">
        <Panel>
          <T variant="bodyStrong">{dataMode === 'api' ? 'Nurture server' : 'Offline demo'}</T>
          <T variant="small">
            {dataMode === 'api'
              ? `Care logs, experts and questions come from ${apiUrl}. Saved items, notes and preferences stay on this phone.`
              : 'No server is configured, so everything is sample data stored on this phone. Set EXPO_PUBLIC_API_URL to connect.'}
          </T>
          <Button label="Check connection" size="sm" variant="secondary" onPress={check} loading={checking} style={{ alignSelf: 'flex-start' }} />
          {health ? (
            <T variant="small" accessibilityLiveRegion="polite">
              {health}
            </T>
          ) : null}
        </Panel>
      </Section>

      {dataMode === 'demo' ? (
        <Section title="Demo tools">
          <Panel tone="blue">
            <Button
              label={failArmed ? 'Next request will fail' : 'Simulate a connection error'}
              size="sm"
              variant="secondary"
              onPress={() => {
                demoFlags.failNextRequest = !failArmed;
                setFailArmed(!failArmed);
              }}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48 },
  backText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.ink2 },
});

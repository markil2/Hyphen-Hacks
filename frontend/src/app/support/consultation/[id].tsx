import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, EmptyState, ListRow, LoadingState, Notice, Panel, Screen, T } from '@/components/ui';
import { ConsultStatusPanel } from '@/features/support/ConsultStatus';
import { relativeTime } from '@/lib/time';
import { remote } from '@/services';
import { stores, useCatalog } from '@/state';
import { messageOf } from '@/state/store';
import { colors, space } from '@/theme';

/** One consultation request: what was asked, its status, and the honest delivery note. */
export default function ConsultationScreen() {
  const { id, notice } = useLocalSearchParams<{ id: string; notice?: string }>();
  const consultations = useCatalog(stores.consultations);
  const c = consultations.items.find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!c) return <Screen back>{consultations.status === 'ready' ? <EmptyState title="Request not found" /> : <LoadingState />}</Screen>;

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      consultations.upsert(await remote.consultations.setStatus(c.id, 'cancelled'));
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen back title="Your request" subtitle={c.expertName ? `To ${c.expertName}` : undefined}>
      {notice ? <Notice tone="sand" text={notice} /> : null}
      <ConsultStatusPanel status={c.status} />
      <Panel>
        <T variant="smallStrong">Your message</T>
        <T>{c.message}</T>
        <ListRow title="Saved" meta={relativeTime(c.createdAt)} last={!c.questionText} />
        {c.questionText ? <ListRow title="Linked question" subtitle={c.questionText} last /> : null}
      </Panel>
      {error ? (
        <T variant="small" style={{ color: colors.danger }} accessibilityRole="alert">
          {error}
        </T>
      ) : null}
      {c.status === 'pending' ? (
        <View style={{ gap: space.xs }}>
          <Button label="Cancel request" variant="danger" onPress={cancel} loading={busy} />
        </View>
      ) : null}
    </Screen>
  );
}

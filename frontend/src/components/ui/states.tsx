import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { colors, radius, space } from '@/theme';

import { Button } from './button';
import { T } from './text';

export function EmptyState({
  icon = 'leaf',
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.box} accessibilityRole="summary">
      <View style={styles.mark}>
        <Icon name={icon} color={colors.sageDeep} />
      </View>
      <T variant="bodyStrong" style={styles.center}>
        {title}
      </T>
      {body ? (
        <T variant="small" style={styles.center}>
          {body}
        </T>
      ) : null}
      {action ? <Button label={action.label} variant="secondary" size="sm" onPress={action.onPress} /> : null}
    </View>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={styles.box} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.ink2} />
      <T variant="small">{label}…</T>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={[styles.box, styles.error]} accessibilityRole="alert">
      <View style={[styles.mark, { backgroundColor: colors.dangerWash }]}>
        <Icon name="alert" color={colors.danger} />
      </View>
      <T variant="bodyStrong" style={styles.center}>
        Couldn’t load this
      </T>
      <T variant="small" style={styles.center}>
        {message ?? 'Something went wrong. Please try again.'}
      </T>
      {onRetry ? <Button label="Try again" variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

/** Renders loading / error / empty / content from a store status in one place. */
export function AsyncBlock({
  status,
  error,
  onRetry,
  isEmpty,
  empty,
  children,
  loadingLabel,
}: {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  onRetry?: () => void;
  isEmpty: boolean;
  empty: React.ReactNode;
  children: React.ReactNode;
  loadingLabel?: string;
}) {
  if (status === 'error') return <ErrorState message={error} onRetry={onRetry} />;
  if (status !== 'ready' && isEmpty) return <LoadingState label={loadingLabel} />;
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  error: { borderStyle: 'solid', borderColor: 'rgba(142,59,46,0.35)', backgroundColor: colors.paper },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sageWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xxs,
  },
  center: { textAlign: 'center', maxWidth: 320 },
});

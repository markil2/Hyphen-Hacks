import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { T } from '@/components/ui';
import { colors, radius, space } from '@/theme';

/**
 * Shown before any question flow. Urgent worries should never wait on this app,
 * so this comes first and asks nothing of the parent.
 */
export function UrgentHelp({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Icon name="alert" color={colors.danger} />
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="smallStrong" style={{ color: colors.danger }}>
          Worried it might be urgent?
        </T>
        <T variant="small" style={{ color: colors.charcoal }}>
          {compact
            ? 'Don’t wait for an answer here — call your pediatrician or your local emergency number now.'
            : 'Don’t wait for an answer here. Call your pediatrician or your local emergency number now. Nurture can’t assess symptoms or give medical advice.'}
        </T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerWash,
    borderWidth: 1,
    borderColor: 'rgba(142,59,46,0.25)',
  },
});

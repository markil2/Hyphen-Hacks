import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { goBack, T } from '@/components/ui';
import { fonts } from '@/theme';

import { BEZEL, BEZEL_EDGE, Grille, screen } from './Console';

/** A full page in the baby-monitor style: beige bezel, a dark screen, LCD headings. */
export function MonitorScreen({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + 4 }]}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => goBack('/')} style={styles.back} hitSlop={8}>
          <Icon name="back" color="#5D554B" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T style={styles.title} accessibilityRole="header">
            {title}
          </T>
          {subtitle ? <T style={styles.sub}>{subtitle}</T> : null}
        </View>
        {right ?? <Grille slots={5} />}
      </View>
      <View style={[styles.screen, { marginBottom: insets.bottom ? insets.bottom - 8 : 10 }]}>
        <ScrollView contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 24 }}>{children}</ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BEZEL, paddingHorizontal: 10 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4, paddingBottom: 10 },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: BEZEL_EDGE },
  title: { fontFamily: fonts.lcd, fontSize: 20, letterSpacing: 1.5, color: '#4A4238', textTransform: 'uppercase' },
  sub: { fontFamily: fonts.body, fontSize: 12.5, color: '#7A6F60' },
  screen: { flex: 1, backgroundColor: screen.bg, borderRadius: 18, borderWidth: 5, borderColor: '#14110E', overflow: 'hidden' },
});

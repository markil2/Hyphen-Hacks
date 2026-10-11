import * as WebBrowser from 'expo-web-browser';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon, IconName } from '@/components/icons';
import { Section, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, radius, space } from '@/theme';

/**
 * Real places to ask a professional right now. Nurture doesn't send anything to them;
 * each link opens the service's own site or phone line. US services.
 */
const PROS: { name: string; what: string; url: string; phone?: string; icon: IconName }[] = [
  { name: 'Your pediatrician', what: 'Their office or nurse line is the best first call for anything about your baby.', url: 'https://www.healthychildren.org/English/family-life/health-management/Pages/Choosing-a-Pediatrician.aspx', icon: 'heart' },
  { name: 'La Leche League', what: 'Free breastfeeding help from trained volunteer leaders.', url: 'https://llli.org/get-help/', icon: 'bottle' },
  { name: 'Postpartum Support International', what: 'Helpline and online support groups for parents’ mental health.', url: 'https://www.postpartum.net/get-help/', phone: '18009444773', icon: 'support' },
  { name: 'National Maternal Mental Health Hotline', what: 'Free, confidential, 24/7 call or text for pregnant and new parents.', url: 'https://mchb.hrsa.gov/national-maternal-mental-health-hotline', phone: '18338526262', icon: 'call' },
  { name: 'Poison Control', what: 'If your baby swallowed something: experts 24/7 by phone or online.', url: 'https://www.poison.org', phone: '18002221222', icon: 'alert' },
  { name: 'HealthyChildren.org', what: 'Answers from the American Academy of Pediatrics.', url: 'https://www.healthychildren.org', icon: 'info' },
];

export function ProLinks() {
  const open = (url: string) => {
    haptic.tap();
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  };
  return (
    <Section title="Ask a professional online">
      <T variant="small">These services answer questions directly. They open on their own sites; nothing from Nurture is shared with them.</T>
      {PROS.map((p) => (
        <View key={p.name} style={styles.row}>
          <Icon name={p.icon} size={20} color={colors.sageDeep} />
          <Pressable accessibilityRole="link" accessibilityLabel={`${p.name}: ${p.what}`} accessibilityHint="Opens their website" onPress={() => open(p.url)} style={{ flex: 1, gap: 2 }}>
            <T variant="smallStrong">{p.name}</T>
            <T variant="caption">{p.what}</T>
          </Pressable>
          {p.phone ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`Call ${p.name}`} onPress={() => Linking.openURL(`tel:${p.phone}`)} hitSlop={6} style={styles.call}>
              <Icon name="call" size={18} color={colors.charcoal} />
            </Pressable>
          ) : (
            <Icon name="link" size={16} color={colors.ink3} />
          )}
        </View>
      ))}
      <T variant="caption">In an emergency, call your local emergency number.</T>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  call: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.creamSoft },
});

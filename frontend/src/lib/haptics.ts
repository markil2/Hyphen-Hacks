import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Small, safe wrappers: haptics are a nicety and must never throw. */
export const haptic = {
  tap() {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  },
  soft() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
  },
  success() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};

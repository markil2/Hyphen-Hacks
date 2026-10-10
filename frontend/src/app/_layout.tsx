import { Lora_400Regular, Lora_400Regular_Italic, Lora_600SemiBold, useFonts } from '@expo-google-fonts/lora';
import { NunitoSans_400Regular, NunitoSans_600SemiBold, NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { startAuth, useAuth } from '@/features/auth/session';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream, card: colors.warmWhite, text: colors.charcoal, primary: colors.charcoal, border: colors.line },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_600SemiBold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  const { phase } = useAuth();
  useEffect(() => {
    startAuth();
  }, []);

  const ready = (loaded || error) && phase !== 'loading';
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ThemeProvider value={theme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'fade', animationDuration: 260 }}>
          {/* Signed out: sign in / sign up / reset. */}
          <Stack.Protected guard={phase === 'signedOut'}>
            <Stack.Screen name="auth/sign-in" />
            <Stack.Screen name="auth/sign-up" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="auth/forgot" options={{ animation: 'slide_from_right' }} />
          </Stack.Protected>
          {/* Signed in, but no baby yet. */}
          <Stack.Protected guard={phase === 'needsBaby'}>
            <Stack.Screen name="onboarding" />
          </Stack.Protected>
          {/* The app. */}
          <Stack.Protected guard={phase === 'ready'}>
            <Stack.Screen name="index" />
            <Stack.Screen name="nursery/sessions" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: '#1B1815' } }} />
            <Stack.Screen name="settings/baby" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="settings/account" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="nursery/edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="kitchen/bottle" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="kitchen/bowl" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

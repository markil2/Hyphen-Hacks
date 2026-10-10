import { InstrumentSans_400Regular, InstrumentSans_500Medium, InstrumentSans_600SemiBold } from '@expo-google-fonts/instrument-sans';
import {
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  useFonts,
} from '@expo-google-fonts/newsreader';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream, card: colors.warmWhite, text: colors.charcoal, primary: colors.charcoal, border: colors.line },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <ThemeProvider value={theme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream }, animation: 'fade', animationDuration: 260 }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="nursery/edit" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="kitchen/bottle" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="kitchen/bowl" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="community/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

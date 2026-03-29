import 'react-native-reanimated';

import { Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAuthStore } from '@/src/store/useAuthStore';
import { colors } from '@/src/theme/tokens';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_700Bold,
    Fredoka_600SemiBold,
  });

  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen
          name="processing"
          options={{ title: 'Scanning', presentation: 'modal' }}
        />
        <Stack.Screen name="results" options={{ title: 'Results' }} />
      </Stack>
    </ThemeProvider>
  );
}

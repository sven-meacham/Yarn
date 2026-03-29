import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { YarnBallButton } from '@/src/components/YarnBallButton';
import { useAuthStore } from '@/src/store/useAuthStore';
import { fontBrandSoft } from '@/src/theme/fonts';
import { colors } from '@/src/theme/tokens';

const SPLASH_MS = 2400;

/** Splash: yarn ball + YARN wordmark, then sign-in or main app if session restored. */
export default function SplashScreen() {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);

  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!bootstrapped) return;
    if (isSignedIn) {
      router.replace('/(tabs)/scan');
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      Animated.timing(fade, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (!cancelled) router.replace('/sign-in');
      });
    }, SPLASH_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [bootstrapped, isSignedIn, fade]);

  if (!bootstrapped) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (isSignedIn) {
    return null;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <YarnBallButton onPress={() => {}} disabled size={100} />
        <Text style={styles.yarnWord}>YARN</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  yarnWord: {
    fontFamily: fontBrandSoft,
    fontSize: 44,
    letterSpacing: 3,
    color: colors.brandTeal,
    textShadowColor: 'rgba(30, 122, 112, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

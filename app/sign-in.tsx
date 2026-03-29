import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { YarnBallButton } from '@/src/components/YarnBallButton';
import { useAuthStore } from '@/src/store/useAuthStore';
import { fontBrandSoft } from '@/src/theme/fonts';
import { colors, radius, spacing } from '@/src/theme/tokens';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [exiting, setExiting] = useState(false);

  const { width: winW } = Dimensions.get('window');
  const tx = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const ballOpacity = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!bootstrapped) return;
    if (isSignedIn) router.replace('/camera');
  }, [bootstrapped, isSignedIn]);

  function runYarnExitAnimation() {
    setExiting(true);
    Animated.timing(formOpacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(tx, {
          toValue: -(winW + 140),
          duration: 580,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: 1,
          duration: 580,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      tx.setValue(winW * 0.65);
      rot.setValue(0);
      scale.setValue(0.92);
      Animated.parallel([
        Animated.spring(tx, {
          toValue: 0,
          friction: 6,
          tension: 48,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.22,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.timing(ballOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          router.replace('/camera');
        });
      });
    });
  }

  async function onContinue() {
    const t = email.trim();
    setErr(null);
    if (!EMAIL_RE.test(t)) {
      setErr('Enter a valid email (demo — not sent anywhere).');
      return;
    }
    setBusy(true);
    try {
      await signIn(t);
      runYarnExitAnimation();
    } finally {
      setBusy(false);
    }
  }

  if (!bootstrapped) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
      </View>
    );
  }

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-720deg'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.ballWrap,
            exiting && { zIndex: 10 },
            {
              opacity: ballOpacity,
              transform: [{ translateX: tx }, { rotate }, { scale }],
            },
          ]}
        >
          <YarnBallButton onPress={() => {}} disabled size={100} />
        </Animated.View>

        <Animated.View style={[styles.formBlock, { opacity: formOpacity }]}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.sub}>
            Hackathon demo — you’ll sign in again each time you open the app (nothing is saved).
          </Text>

          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            editable={!exiting && !busy}
            onChangeText={setEmail}
          />
          {err ? <Text style={styles.err}>{err}</Text> : null}

          <PrimaryButton
            label="Create account & continue"
            onPress={onContinue}
            disabled={exiting}
            loading={busy}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 72,
    alignItems: 'center',
  },
  ballWrap: {
    marginBottom: spacing.xl,
  },
  formBlock: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  title: {
    fontFamily: fontBrandSoft,
    fontSize: 38,
    letterSpacing: 2,
    color: colors.brandPink,
    textAlign: 'center',
    textShadowColor: 'rgba(232, 121, 184, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  err: {
    color: colors.danger,
    fontSize: 14,
  },
});

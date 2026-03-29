import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { YarnBallGraphic } from '@/src/components/YarnBallGraphic';
import { processTagImage, processTagLocalFallback } from '@/src/services/processTag';
import { buildCategoryExplanations } from '@/src/services/categoryExplanations';
import { computeFullScore } from '@/src/services/score';
import { useScanHistoryStore } from '@/src/store/useScanHistoryStore';
import { useScanStore } from '@/src/store/useScanStore';
import type { FullScanResult } from '@/src/types/tagParse';
import { colors, spacing } from '@/src/theme/tokens';
import { computeMissingFields } from '@/src/utils/tagFields';

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri: string; mime?: string }>();
  const setResult = useScanStore((s) => s.setResult);

  const [status, setStatus] = useState('Reading tag…');
  const [error, setError] = useState<string | null>(null);
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(bounce, {
          toValue: 0,
          friction: 4.5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [bounce]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      const useMock = process.env.EXPO_PUBLIC_USE_MOCK_TAG === '1';
      const rawUri = params.uri ? decodeURIComponent(params.uri) : '';
      const mime = params.mime ?? 'image/jpeg';

      if (!useMock && !rawUri) {
        setError('No image. Go back and pick a photo.');
        return;
      }

      try {
        setStatus('Reading tag…');
        let pipeline: {
          rawText: string;
          parsed: FullScanResult['parsed'];
          explanation: string;
        };

        if (useMock) {
          const demo = `Nike
60% Cotton
40% Polyester
Made in Vietnam`;
          const fb = await processTagLocalFallback(demo);
          pipeline = {
            rawText: fb.rawText,
            parsed: fb.parsed,
            explanation: fb.explanation,
          };
        } else {
          const res = await processTagImage(rawUri, mime);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          pipeline = {
            rawText: res.rawText,
            parsed: res.parsed,
            explanation: res.explanation,
          };
        }

        if (cancelled) return;

        setStatus('Looking up materials…');
        const scores = await computeFullScore(pipeline.parsed);
        const categoryExplanations = await buildCategoryExplanations(pipeline.parsed, scores);

        if (cancelled) return;

        const full: FullScanResult = {
          parsed: pipeline.parsed,
          rawText: pipeline.rawText,
          explanation: pipeline.explanation,
          brandScore: scores.brandScore,
          materialScore: scores.materialScore,
          materialQualityScore: scores.materialQualityScore,
          countryScore: scores.countryScore,
          overallScore: scores.overallScore,
          countryNote: scores.countryNote,
          brandName: pipeline.parsed.brand,
          tagImageUri: useMock ? null : rawUri,
          missingFields: computeMissingFields(pipeline.parsed),
          categoryExplanations,
          brandLibraryBreakdown: scores.brandLibraryBreakdown,
        };

        setResult(full);
        useScanHistoryStore.getState().addFromResult(full);
        router.replace('/results');
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Something went wrong';
        setError(msg);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [params.uri, params.mime, router, setResult]);

  const bounceY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -36],
  });

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.bounceStage}>
          <View style={styles.ground} />
          <Animated.View style={{ transform: [{ translateY: bounceY }] }}>
            <YarnBallGraphic size={76} emphasized />
          </Animated.View>
        </View>
        <Text style={styles.status}>{status}</Text>
        {error ? (
          <View style={styles.errBox}>
            <Text style={styles.err}>{error}</Text>
            <PrimaryButton label="Try again" onPress={() => router.back()} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  bounceStage: {
    height: 120,
    width: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ground: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(42, 168, 154, 0.35)',
  },
  status: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.textMuted,
  },
  errBox: {
    marginTop: spacing.lg,
    width: '100%',
    gap: spacing.md,
  },
  err: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

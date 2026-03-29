import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { processTagImage, processTagLocalFallback } from '@/src/services/processTag';
import { computeFullScore } from '@/src/services/score';
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

        if (cancelled) return;

        const full: FullScanResult = {
          parsed: pipeline.parsed,
          rawText: pipeline.rawText,
          explanation: pipeline.explanation,
          brandScore: scores.brandScore,
          materialScore: scores.materialScore,
          countryScore: scores.countryScore,
          overallScore: scores.overallScore,
          countryNote: scores.countryNote,
          brandName: pipeline.parsed.brand,
          tagImageUri: useMock ? null : rawUri,
          missingFields: computeMissingFields(pipeline.parsed),
        };

        setResult(full);
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

  return (
    <Screen>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
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
  status: {
    marginTop: spacing.md,
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

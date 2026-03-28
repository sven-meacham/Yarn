import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScoreBar } from '@/src/components/ScoreBar';
import { Screen } from '@/src/components/Screen';
import { useScanStore } from '@/src/store/useScanStore';
import { colors, spacing } from '@/src/theme/tokens';

export default function ResultsScreen() {
  const router = useRouter();
  const result = useScanStore((s) => s.result);

  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  const { overallScore, brandScore, materialScore, countryScore, explanation, countryNote, parsed, rawText } =
    result;

  const tint =
    overallScore >= 70 ? colors.scoreHigh : overallScore >= 45 ? colors.scoreMid : colors.scoreLow;

  const matSummary = parsed.materials
    .map((m) => `${Math.round(m.percent)}% ${m.name}`)
    .join(' · ');

  return (
    <Screen scroll>
      <Text style={styles.overallLabel}>Sustainability score</Text>
      <Text style={[styles.overallNum, { color: tint }]}>{overallScore}</Text>
      <Text style={styles.outOf}>out of 100 (demo)</Text>

      <View style={styles.card}>
        <ScoreBar label="Brand" value={brandScore} />
        <ScoreBar label="Materials" value={materialScore} />
        <ScoreBar label="Country" value={countryScore} />
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>What we found</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>{parsed.brand}</Text>
          {' · '}
          {matSummary}
          {parsed.country ? (
            <>
              {' · '}
              Made in <Text style={styles.bold}>{parsed.country}</Text>
            </>
          ) : null}
        </Text>
      </View>

      {countryNote ? (
        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Country note</Text>
          <Text style={styles.body}>{countryNote}</Text>
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.sectionTitle}>Why this score</Text>
        <Text style={styles.body}>{explanation}</Text>
      </View>

      <View style={styles.rawWrap}>
        <Text style={styles.rawLabel}>Raw tag text</Text>
        <Text style={styles.rawText}>{rawText}</Text>
      </View>

      <PrimaryButton
        label="Scan another tag"
        onPress={() => {
          useScanStore.getState().setResult(null);
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  overallLabel: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overallNum: {
    fontSize: 72,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  outOf: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  rawWrap: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rawLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rawText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
});

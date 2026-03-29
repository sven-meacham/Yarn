import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AddDetailsModal } from '@/src/components/AddDetailsModal';
import { CategoryBreakdownRow } from '@/src/components/CategoryBreakdownRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useScanStore } from '@/src/store/useScanStore';
import { colors, spacing } from '@/src/theme/tokens';
import { mergeUserDetails, type UserDetailFields } from '@/src/utils/mergeUserDetails';
import { dotColor, scoreLabel } from '@/src/utils/tagFields';

export default function ResultsScreen() {
  const router = useRouter();
  const result = useScanStore((s) => s.result);
  const updateParsedAndRescore = useScanStore((s) => s.updateParsedAndRescore);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!result) {
      router.replace('/');
    }
  }, [result, router]);

  async function onSaveDetails(fields: UserDetailFields) {
    if (!result) return;
    const merged = mergeUserDetails(result.parsed, fields);
    await updateParsedAndRescore(merged);
  }

  if (!result) {
    return null;
  }

  const {
    overallScore,
    brandScore,
    materialScore,
    countryScore,
    explanation,
    countryNote,
    parsed,
    rawText,
    tagImageUri,
    missingFields,
  } = result;

  const overallTint = dotColor(overallScore);
  const label = scoreLabel(overallScore);

  const matSummary = parsed.materials
    .map((m) => `${Math.round(m.percent)}% ${m.name}`)
    .join(' · ');

  const brandSubtitle = missingFields.brand
    ? 'Not detected from tag — score uses defaults.'
    : `Recognized from care label.`;
  const matSubtitle = missingFields.materials
    ? 'Fiber breakdown not found — score uses defaults.'
    : matSummary || 'No materials listed.';
  const countrySubtitle = missingFields.country
    ? 'Country of manufacture not found — score uses defaults.'
    : parsed.country && parsed.country.toLowerCase() !== 'unknown'
      ? `Made in ${parsed.country}.`
      : 'Origin unclear.';

  return (
    <Screen scroll>
      <View style={styles.hero}>
        {tagImageUri ? (
          <Image source={{ uri: tagImageUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <View style={styles.heroText}>
          <Text style={styles.productTitle} numberOfLines={3}>
            {parsed.brand && parsed.brand.toLowerCase() !== 'unknown'
              ? `${parsed.brand} — tag scan`
              : 'Clothing tag scan'}
          </Text>
          <Text style={styles.brandSub} numberOfLines={2}>
            {parsed.brand && parsed.brand.toLowerCase() !== 'unknown' ? parsed.brand : 'Brand pending'}
          </Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <View style={[styles.bigDot, { backgroundColor: overallTint }]} />
        <Text style={styles.scoreFraction}>
          {overallScore}
          <Text style={styles.scoreOutOf}>/100</Text>
        </Text>
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>

      <Text style={styles.sectionHead}>Categories</Text>
      <View style={styles.listCard}>
        <CategoryBreakdownRow
          icon="pricetag-outline"
          title="Brand"
          subtitle={brandSubtitle}
          valueRight={parsed.brand && parsed.brand.toLowerCase() !== 'unknown' ? parsed.brand : '—'}
          score={brandScore}
          showAddDetails={!!missingFields.brand}
          onAddDetails={() => setDetailsOpen(true)}
        />
        <CategoryBreakdownRow
          icon="shirt-outline"
          title="Materials"
          subtitle={matSubtitle}
          valueRight={
            missingFields.materials ? '—' : matSummary.length > 28 ? `${matSummary.slice(0, 28)}…` : matSummary
          }
          score={materialScore}
          showAddDetails={!!missingFields.materials}
          onAddDetails={() => setDetailsOpen(true)}
        />
        <CategoryBreakdownRow
          icon="earth-outline"
          title="Place of manufacturing"
          subtitle={countrySubtitle}
          valueRight={
            parsed.country && parsed.country.toLowerCase() !== 'unknown' ? parsed.country : '—'
          }
          score={countryScore}
          showAddDetails={!!missingFields.country}
          onAddDetails={() => setDetailsOpen(true)}
        />
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

      <AddDetailsModal
        visible={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onSave={onSaveDetails}
        initialBrand={parsed.brand === 'Unknown' ? '' : parsed.brand}
        initialMaterialsText={
          missingFields.materials
            ? ''
            : parsed.materials.map((m) => `${m.percent}% ${m.name}`).join('\n')
        }
        initialCountry={parsed.country === 'Unknown' ? '' : parsed.country}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  thumb: {
    width: 112,
    height: 112,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  thumbPlaceholder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingTop: 4,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
  },
  brandSub: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textMuted,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  bigDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: spacing.sm,
  },
  scoreFraction: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
  },
  scoreOutOf: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionHead: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
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

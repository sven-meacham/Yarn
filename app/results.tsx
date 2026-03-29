import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AddDetailsModal } from '@/src/components/AddDetailsModal';
import { CategoryBreakdownRow } from '@/src/components/CategoryBreakdownRow';
import { ExplanationCard } from '@/src/components/ExplanationCard';
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
      router.replace('/camera');
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
    parsed,
    rawText,
    tagImageUri,
    missingFields,
    categoryExplanations,
  } = result;

  const overallTint = dotColor(overallScore);
  const label = scoreLabel(overallScore);
  const scoreBandBg =
    overallScore >= 70 ? colors.explainerMaterialsBg : overallScore >= 45 ? colors.explainerWarnBg : '#FDE8E4';

  const matSummary = parsed.materials
    .map((m) => `${Math.round(m.percent)}% ${m.name}`)
    .join(' · ');

  const brandSubtitle = missingFields.brand
    ? 'Not on tag — neutral default.'
    : 'From care label.';
  const matSubtitle = missingFields.materials
    ? 'Not detected — neutral default.'
    : matSummary || 'No fibers listed.';
  const countrySubtitle = missingFields.country
    ? 'Not detected — neutral default.'
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

      <View style={[styles.scoreBand, { backgroundColor: scoreBandBg }]}>
        <View style={styles.scoreRow}>
          <View style={[styles.bigDot, { backgroundColor: overallTint }]} />
          <View>
            <Text style={styles.scoreFraction}>
              {overallScore}
              <Text style={styles.scoreOutOf}>/100</Text>
            </Text>
            <Text style={[styles.scoreLabel, { color: overallTint }]}>{label}</Text>
          </View>
        </View>
        <Text style={styles.scoreHint}>Weighted: brand 50% · materials 35% · country 15%</Text>
      </View>

      <Text style={styles.sectionHead}>Scores</Text>
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

      <Text style={styles.sectionHead}>What this means</Text>
      <ExplanationCard
        title="Brand"
        body={categoryExplanations.brand}
        accent={colors.explainerBrand}
        background={colors.explainerBrandBg}
      />
      <ExplanationCard
        title="Materials"
        body={categoryExplanations.materials}
        accent={colors.explainerMaterials}
        background={colors.explainerMaterialsBg}
      />
      <ExplanationCard
        title="Place of manufacturing"
        body={categoryExplanations.country}
        accent={colors.explainerCountry}
        background={colors.explainerCountryBg}
      />

      <ExplanationCard
        title="Tag read (AI / OCR)"
        body={explanation.trim() || 'No extra detail from the parser.'}
        accent={colors.explainerTag}
        background={colors.explainerTagBg}
      />

      <View style={styles.rawWrap}>
        <Text style={styles.rawLabel}>Raw tag text</Text>
        <Text style={styles.rawText}>{rawText}</Text>
      </View>

      <PrimaryButton
        label="Scan another tag"
        onPress={() => {
          useScanStore.getState().setResult(null);
          router.replace('/camera');
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
  scoreBand: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bigDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  scoreFraction: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
  },
  scoreOutOf: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scoreLabel: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
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

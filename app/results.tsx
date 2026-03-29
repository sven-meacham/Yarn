import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { AddDetailsModal } from '@/src/components/AddDetailsModal';
import { ExpandableCategoryScore } from '@/src/components/ExpandableCategoryScore';
import { ExplanationCard } from '@/src/components/ExplanationCard';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Screen } from '@/src/components/Screen';
import { useScanStore } from '@/src/store/useScanStore';
import { colors, spacing } from '@/src/theme/tokens';
import { flagEmojiForCountry } from '@/src/utils/countryFlags';
import { mergeUserDetails, type UserDetailFields } from '@/src/utils/mergeUserDetails';
import { dotColor, scoreLabel } from '@/src/utils/tagFields';

type OpenSection = null | 'brand' | 'materials' | 'country';

export default function ResultsScreen() {
  const router = useRouter();
  const result = useScanStore((s) => s.result);
  const updateParsedAndRescore = useScanStore((s) => s.updateParsedAndRescore);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<OpenSection>(null);

  useEffect(() => {
    if (!result) {
      router.replace('/(tabs)/scan');
    }
  }, [result, router]);

  async function onSaveDetails(fields: UserDetailFields) {
    if (!result) return;
    const merged = mergeUserDetails(result.parsed, fields);
    await updateParsedAndRescore(merged);
  }

  function toggle(section: Exclude<OpenSection, null>) {
    setOpenSection((cur) => (cur === section ? null : section));
  }

  if (!result) {
    return null;
  }

  const {
    overallScore,
    brandScore: brandFromResult,
    materialScore,
    materialQualityScore: mqFromResult,
    countryScore,
    explanation,
    parsed,
    rawText,
    tagImageUri,
    missingFields,
    categoryExplanations,
    brandLibraryBreakdown,
  } = result;

  const materialQualityScore = mqFromResult ?? materialScore;
  const brandScore = brandFromResult ?? 50;

  const overallTint = dotColor(overallScore);
  const label = scoreLabel(overallScore);
  const scoreBandBg =
    overallScore >= 70
      ? colors.explainerMaterialsBg
      : overallScore >= 45
        ? colors.explainerWarnBg
        : colors.scoreBandLowBg;

  const matSummary = parsed.materials
    .map((m) => `${Math.round(m.percent)}% ${m.name}`)
    .join(' · ');

  const brandHeadline =
    parsed.brand && parsed.brand.toLowerCase() !== 'unknown' ? parsed.brand : '—';
  const matHeadline = missingFields.materials ? '—' : matSummary || 'No fibers listed.';
  const countryKnown =
    parsed.country && parsed.country.toLowerCase() !== 'unknown' && parsed.country.trim() !== '';
  const countryHeadline = countryKnown ? parsed.country : '—';

  const brandSubtitle = missingFields.brand
    ? 'Not on tag — neutral default.'
    : 'From care label.';
  const matSubtitle = missingFields.materials
    ? 'Not detected — neutral default.'
    : `${matSummary || 'No fibers listed.'} · Library: sustainability + fiber quality`;
  const countrySubtitle = missingFields.country
    ? 'Not detected — neutral default.'
    : countryKnown
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
        <Text style={styles.scoreHint}>
          Weighted: fiber sustainability 35% · place of manufacture 25% · brand practices 25% · fiber
          quality 15%
        </Text>
      </View>

      <Text style={styles.sectionHead}>Scores</Text>
      <View style={styles.listCard}>
        <ExpandableCategoryScore
          icon="pricetag-outline"
          title="Brand practices"
          headline={brandHeadline}
          subtitle={brandSubtitle}
          score={brandScore}
          accent={colors.explainerBrand}
          background={colors.explainerBrandBg}
          explanationBody={categoryExplanations.brand}
          expanded={openSection === 'brand'}
          onToggle={() => toggle('brand')}
          showAddDetails={!!missingFields.brand}
          onAddDetails={() => setDetailsOpen(true)}
          brandScoreBreakdown={
            brandLibraryBreakdown
              ? { componentScore: brandScore, library: brandLibraryBreakdown }
              : null
          }
        />
        <ExpandableCategoryScore
          icon="shirt-outline"
          title="Materials"
          headline={matHeadline}
          subtitle={matSubtitle}
          score={materialScore}
          secondaryScore={{
            label: 'Fiber quality',
            value: materialQualityScore,
          }}
          accent={colors.explainerMaterials}
          background={colors.explainerMaterialsBg}
          explanationBody={categoryExplanations.materials}
          expanded={openSection === 'materials'}
          onToggle={() => toggle('materials')}
          showAddDetails={!!missingFields.materials}
          onAddDetails={() => setDetailsOpen(true)}
        />
        <ExpandableCategoryScore
          icon="earth-outline"
          title="Place of manufacturing"
          headline={countryHeadline}
          headlineExtra={countryKnown ? flagEmojiForCountry(parsed.country) : undefined}
          subtitle={countrySubtitle}
          score={countryScore}
          accent={colors.explainerCountry}
          background={colors.explainerCountryBg}
          explanationBody={categoryExplanations.country}
          expanded={openSection === 'country'}
          onToggle={() => toggle('country')}
          showAddDetails={!!missingFields.country}
          onAddDetails={() => setDetailsOpen(true)}
          isLast
        />
      </View>

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
          router.replace('/(tabs)/scan');
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

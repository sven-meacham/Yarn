import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BrandRow, CountryRow, MaterialRow } from '@/src/services/supabase';
import {
  fetchBrandById,
  fetchCountryById,
  fetchMaterialById,
} from '@/src/services/supabase';
import { COUNTRY_SCORE_FROM_RISK } from '@/src/services/score';
import { colors, radius, spacing } from '@/src/theme/tokens';

type Kind = 'brand' | 'material' | 'country';

function Card({
  kicker,
  children,
  muted,
}: {
  kicker: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardKicker}>{kicker}</Text>
      {typeof children === 'string' ? (
        <Text style={muted ? styles.bodyMuted : styles.body}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export default function TopDetailScreen() {
  const insets = useSafeAreaInsets();
  const { kind, id, rank } = useLocalSearchParams<{
    kind: string;
    id: string;
    rank: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<BrandRow | null>(null);
  const [material, setMaterial] = useState<MaterialRow | null>(null);
  const [country, setCountry] = useState<CountryRow | null>(null);

  const k = (kind ?? '') as Kind;
  const rankNum = rank ? parseInt(rank, 10) : 0;

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (k === 'brand') {
        setBrand(await fetchBrandById(id));
        setMaterial(null);
        setCountry(null);
      } else if (k === 'material') {
        setMaterial(await fetchMaterialById(id));
        setBrand(null);
        setCountry(null);
      } else if (k === 'country') {
        setCountry(await fetchCountryById(id));
        setBrand(null);
        setMaterial(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id, k]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.fill}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (!id || !['brand', 'material', 'country'].includes(k)) {
    return (
      <View style={styles.fill}>
        <View style={styles.center}>
          <Text style={styles.muted}>Missing item.</Text>
        </View>
      </View>
    );
  }

  if (k === 'brand' && !brand) {
    return (
      <View style={styles.fill}>
        <View style={styles.center}>
          <Text style={styles.muted}>Could not load this brand.</Text>
        </View>
      </View>
    );
  }
  if (k === 'material' && !material) {
    return (
      <View style={styles.fill}>
        <View style={styles.center}>
          <Text style={styles.muted}>Could not load this material.</Text>
        </View>
      </View>
    );
  }
  if (k === 'country' && !country) {
    return (
      <View style={styles.fill}>
        <View style={styles.center}>
          <Text style={styles.muted}>Could not load this country.</Text>
        </View>
      </View>
    );
  }

  const bottomPad = insets.bottom + spacing.lg;

  return (
    <View style={styles.fill}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {k === 'brand' && brand ? (
          <>
            <Text style={styles.title}>{brand.name.replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
            <Text style={styles.rankLine}>No. {rankNum} on this list</Text>

            <Card kicker="About">
              {brand.short_description?.trim() || 'No short summary yet.'}
            </Card>

            <Card kicker="Scores">
              <Text style={styles.metric}>Overall: {brand.overall_brand_score}/100</Text>
              <Text style={styles.metric}>Ethics: {brand.ethics_score}/100</Text>
              <Text style={styles.metric}>Sustainability: {brand.sustainability_score}/100</Text>
              <Text style={styles.metric}>Transparency: {brand.transparency_score}/100</Text>
            </Card>

            <Card kicker="How this list works" muted>
              Brands are ordered by overall score (highest first). That score mixes ethics,
              sustainability, and transparency—not popularity.
            </Card>

            {brand.notes?.trim() && !brand.short_description?.trim() ? (
              <Card kicker="Reference notes">
                <Text style={styles.bodyMuted}>{brand.notes.trim()}</Text>
              </Card>
            ) : brand.notes?.trim() && brand.short_description?.trim() ? (
              <Card kicker="More detail">
                <Text style={styles.bodyMuted}>{brand.notes.trim()}</Text>
              </Card>
            ) : null}
          </>
        ) : null}

        {k === 'material' && material ? (
          <>
            <Text style={styles.title}>
              {material.name.replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
            <Text style={styles.rankLine}>No. {rankNum} on this list</Text>

            <Card kicker="About">
              {material.short_description?.trim() || 'No short summary yet.'}
            </Card>

            <Card kicker="Scores">
              <Text style={styles.metric}>Sustainability: {material.sustainability_score}/100</Text>
              <Text style={styles.metric}>Quality: {material.quality_score}/100</Text>
              {material.score_adjustment != null && material.score_adjustment !== 0 ? (
                <Text style={styles.metric}>Adjustment: {material.score_adjustment}</Text>
              ) : null}
            </Card>

            <Card kicker="How this list works" muted>
              Materials are ordered by sustainability score (highest first). Quality is shown
              separately and also feeds your scan score.
            </Card>

            {material.sustainability_note?.trim() ? (
              <Card kicker="Sustainability detail">
                <Text style={styles.bodyMuted}>{material.sustainability_note.trim()}</Text>
              </Card>
            ) : null}
            {material.health_note?.trim() ? (
              <Card kicker="Wear and feel">
                <Text style={styles.body}>{material.health_note.trim()}</Text>
              </Card>
            ) : null}
          </>
        ) : null}

        {k === 'country' && country ? (
          <>
            <Text style={styles.title}>{country.name}</Text>
            <Text style={styles.rankLine}>No. {rankNum} on this list</Text>

            <Card kicker="About">
              {country.short_description?.trim() || 'No short summary yet.'}
            </Card>

            <Card kicker="Scores">
              <Text style={styles.metric}>
                Manufacturing risk: {country.manufacturing_risk_score}/100 (lower is better for this
                ranking)
              </Text>
              <Text style={styles.metric}>
                Place score: {COUNTRY_SCORE_FROM_RISK(country.manufacturing_risk_score)}/100
              </Text>
            </Card>

            <Card kicker="How this list works" muted>
              Countries are ordered by lowest manufacturing risk first. The place score is 100
              minus risk so higher feels better on screen.
            </Card>

            {country.note?.trim() && !country.short_description?.trim() ? (
              <Card kicker="Reference notes">
                <Text style={styles.bodyMuted}>{country.note.trim()}</Text>
              </Card>
            ) : country.note?.trim() && country.short_description?.trim() ? (
              <Card kicker="More detail">
                <Text style={styles.bodyMuted}>{country.note.trim()}</Text>
              </Card>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  muted: {
    fontSize: 15,
    color: colors.textMuted,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  rankLine: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardKicker: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bodyMuted: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  metric: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
});

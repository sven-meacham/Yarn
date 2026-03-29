import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/src/components/Screen';
import { TabYarnIcon } from '@/src/components/TabYarnIcon';
import type { BrandRow, CountryRow, MaterialRow } from '@/src/services/supabase';
import {
  fetchTopBrands,
  fetchTopCountries,
  fetchTopMaterials,
} from '@/src/services/supabase';
import { fontBrand } from '@/src/theme/fonts';
import { colors, radius, spacing } from '@/src/theme/tokens';
import { dotColor } from '@/src/utils/tagFields';
import { flagEmojiForCountry } from '@/src/utils/countryFlags';
import { materialTabIcon } from '@/src/utils/materialTabIcon';
import { COUNTRY_SCORE_FROM_RISK } from '@/src/services/score';

type Segment = 'brands' | 'materials' | 'countries';

function BrandGlyph({ name }: { name: string }) {
  const ch = (name.trim().charAt(0) || '?').toUpperCase();
  return (
    <View style={styles.glyphBrand}>
      <Text style={styles.glyphBrandText}>{ch}</Text>
    </View>
  );
}

function TopRow({
  rank,
  title,
  subtitle,
  score,
  left,
  onPress,
}: {
  rank: number;
  title: string;
  subtitle: string;
  score: number;
  left: ReactNode;
  onPress: () => void;
}) {
  const tint = dotColor(score);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityRole="button"
    >
      {left}
      <Text style={styles.rank}>{rank}</Text>
      <View style={styles.mid}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={2}>
          {subtitle}
        </Text>
        <View style={styles.scoreRow}>
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <Text style={styles.scoreNum}>{score}/100</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.border} />
    </Pressable>
  );
}

const SEGMENT_LEAD: Record<Segment, string> = {
  brands: 'Top 10 by library overall score (ethics · sustainability · transparency).',
  materials: 'Top 10 by fiber sustainability score in the library.',
  countries: 'Top 10 by lowest manufacturing risk (display score = 100 − risk).',
};

export default function TopsIndexScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>('brands');
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, m, c] = await Promise.all([
        fetchTopBrands(10),
        fetchTopMaterials(10),
        fetchTopCountries(10),
      ]);
      setBrands(b);
      setMaterials(m);
      setCountries(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openDetail(kind: 'brand' | 'material' | 'country', id: string, rank: number) {
    router.push({
      pathname: '/(tabs)/tops/detail',
      params: { kind, id, rank: String(rank) },
    });
  }

  return (
    <Screen scroll={false}>
      <View style={styles.brandBar}>
        <TabYarnIcon size={28} />
        <Text style={styles.brandWordmark}>Yarn</Text>
      </View>
      <View style={styles.segmentWrap}>
        <Pressable
          onPress={() => setSegment('brands')}
          style={({ pressed }) => [
            styles.segmentBtn,
            segment === 'brands' && styles.segmentBtnActive,
            pressed && styles.segmentPressed,
          ]}
        >
          <Ionicons
            name="ribbon-outline"
            size={20}
            color={segment === 'brands' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[styles.segmentLabel, segment === 'brands' && styles.segmentLabelActive]}
          >
            Brands
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('materials')}
          style={({ pressed }) => [
            styles.segmentBtn,
            segment === 'materials' && styles.segmentBtnActive,
            pressed && styles.segmentPressed,
          ]}
        >
          <Ionicons
            name="leaf-outline"
            size={20}
            color={segment === 'materials' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentLabel,
              segment === 'materials' && styles.segmentLabelActive,
            ]}
          >
            Materials
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSegment('countries')}
          style={({ pressed }) => [
            styles.segmentBtn,
            segment === 'countries' && styles.segmentBtnActive,
            pressed && styles.segmentPressed,
          ]}
        >
          <Ionicons
            name="earth-outline"
            size={20}
            color={segment === 'countries' ? colors.accent : colors.textMuted}
          />
          <Text
            style={[
              styles.segmentLabel,
              segment === 'countries' && styles.segmentLabelActive,
            ]}
          >
            Countries
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.pageLead}>{SEGMENT_LEAD[segment]}</Text>

          {segment === 'brands' &&
            brands.map((row, i) => (
              <TopRow
                key={row.id}
                rank={i + 1}
                title={row.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                subtitle={`Library overall · sustainability factor ${row.sustainability_score}/100`}
                score={row.overall_brand_score}
                left={<BrandGlyph name={row.name} />}
                onPress={() => openDetail('brand', row.id, i + 1)}
              />
            ))}

          {segment === 'materials' &&
            materials.map((row, i) => (
              <TopRow
                key={row.id}
                rank={i + 1}
                title={row.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                subtitle="Material sustainability (library)"
                score={row.sustainability_score}
                left={
                  <View style={styles.glyphMat}>
                    <Ionicons name={materialTabIcon(row.name)} size={22} color={colors.accent} />
                  </View>
                }
                onPress={() => openDetail('material', row.id, i + 1)}
              />
            ))}

          {segment === 'countries' &&
            countries.map((row, i) => {
              const placeScore = COUNTRY_SCORE_FROM_RISK(row.manufacturing_risk_score);
              return (
                <TopRow
                  key={row.id}
                  rank={i + 1}
                  title={row.name}
                  subtitle={`Manufacturing risk ${row.manufacturing_risk_score}/100 (lower is better)`}
                  score={placeScore}
                  left={<Text style={styles.flag}>{flagEmojiForCountry(row.name)}</Text>}
                  onPress={() => openDetail('country', row.id, i + 1)}
                />
              );
            })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
    paddingBottom: spacing.xs,
  },
  brandWordmark: {
    fontFamily: fontBrand,
    fontSize: 26,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  segmentWrap: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: colors.tabPill,
    borderColor: colors.tabPillBorder,
  },
  segmentPressed: {
    opacity: 0.85,
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.accent,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl * 2,
  },
  pageLead: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  rowPressed: {
    opacity: 0.88,
  },
  rank: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
    width: 22,
    textAlign: 'center',
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreNum: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  glyphBrand: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.explainerBrandBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphBrandText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.explainerBrand,
  },
  glyphMat: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.explainerMaterialsBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 32,
    width: 44,
    textAlign: 'center',
  },
});

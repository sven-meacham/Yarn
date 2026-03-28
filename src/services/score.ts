import type { ParsedMaterial, ParsedTag } from '@/src/types/tagParse';

import type { MaterialRow } from '@/src/services/supabase';
import { fetchBrandByName, fetchCountryByName, fetchMaterialByName } from '@/src/services/supabase';
import { normalizeMaterialKey } from '@/src/utils/materials';

/** manufacturing_risk_score: higher = worse for workers/environment → invert for sustainability component */
export const COUNTRY_SCORE_FROM_RISK = (risk: number) =>
  Math.max(0, Math.min(100, 100 - risk));

const DEFAULT_COMPONENT = 50;

const WEIGHT_BRAND = 0.5;
const WEIGHT_MATERIAL = 0.35;
const WEIGHT_COUNTRY = 0.15;

function materialBaseScore(row: MaterialRow): number {
  const adj = row.score_adjustment ?? 0;
  return Math.max(0, Math.min(100, row.sustainability_score + adj));
}

export async function computeMaterialScore(materials: ParsedMaterial[]): Promise<number> {
  if (materials.length === 0) return DEFAULT_COMPONENT;

  let sumPct = materials.reduce((a, m) => a + m.percent, 0);
  const normalized = materials.map((m) => ({
    name: normalizeMaterialKey(m.name),
    percent: m.percent,
  }));

  if (sumPct < 60 || sumPct > 140) {
    const equal = 100 / normalized.length;
    normalized.forEach((m, i) => {
      normalized[i] = { ...m, percent: equal };
    });
    sumPct = 100;
  } else if (sumPct !== 100 && sumPct > 0) {
    normalized.forEach((m, i) => {
      normalized[i] = { ...m, percent: (m.percent / sumPct) * 100 };
    });
  }

  let weighted = 0;
  for (const m of normalized) {
    const row = await fetchMaterialByName(m.name);
    const base = row ? materialBaseScore(row) : DEFAULT_COMPONENT;
    weighted += base * (m.percent / 100);
  }

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

export async function computeBrandScore(brandName: string): Promise<number> {
  const key = brandName.trim();
  if (!key) return DEFAULT_COMPONENT;
  const row = await fetchBrandByName(key);
  if (!row) return DEFAULT_COMPONENT;
  return Math.max(0, Math.min(100, row.overall_brand_score));
}

export async function computeCountryScore(countryName: string): Promise<{
  score: number;
  note: string | null;
}> {
  const key = countryName.trim();
  if (!key) return { score: DEFAULT_COMPONENT, note: null };
  const row = await fetchCountryByName(key);
  if (!row) return { score: DEFAULT_COMPONENT, note: null };
  return {
    score: COUNTRY_SCORE_FROM_RISK(row.manufacturing_risk_score),
    note: row.note,
  };
}

export async function computeFullScore(parsed: ParsedTag): Promise<{
  brandScore: number;
  materialScore: number;
  countryScore: number;
  overallScore: number;
  countryNote: string | null;
}> {
  const [brandScore, materialScore, countryPart] = await Promise.all([
    computeBrandScore(parsed.brand),
    computeMaterialScore(parsed.materials),
    computeCountryScore(parsed.country),
  ]);

  const overall = Math.round(
    WEIGHT_BRAND * brandScore +
      WEIGHT_MATERIAL * materialScore +
      WEIGHT_COUNTRY * countryPart.score,
  );

  return {
    brandScore,
    materialScore,
    countryScore: countryPart.score,
    overallScore: Math.max(0, Math.min(100, overall)),
    countryNote: countryPart.note,
  };
}

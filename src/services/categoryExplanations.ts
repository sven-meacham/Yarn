import { fetchBrandByName, fetchCountryByName, fetchMaterialByName } from '@/src/services/supabase';
import type { ParsedMaterial, ParsedTag } from '@/src/types/tagParse';
import { normalizeMaterialKey } from '@/src/utils/materials';

const SYNTHETIC_KEYS = new Set([
  'polyester',
  'recycled polyester',
  'nylon',
  'elastane',
  'acrylic',
]);

function isUnknownBrand(s: string): boolean {
  const t = s.trim().toLowerCase();
  return !t || t === 'unknown' || t === 'n/a';
}

function isUnknownCountry(s: string): boolean {
  return isUnknownBrand(s);
}

function syntheticPercent(materials: ParsedMaterial[]): number {
  let n = 0;
  for (const m of materials) {
    const k = normalizeMaterialKey(m.name);
    if (SYNTHETIC_KEYS.has(k)) n += m.percent;
  }
  return Math.min(100, n);
}

function missingMaterials(materials: ParsedMaterial[]): boolean {
  if (!materials?.length) return true;
  if (materials.length === 1) {
    const x = materials[0].name.trim().toLowerCase();
    if (x === 'unknown' || x === 'n/a') return true;
  }
  return false;
}

type Scores = { brandScore: number; materialScore: number; countryScore: number };

/**
 * Explicit copy for the results screen: pulls Supabase notes when present,
 * otherwise states clearly what the default means.
 */
export async function buildCategoryExplanations(
  parsed: ParsedTag,
  scores: Scores,
): Promise<{ brand: string; materials: string; country: string }> {
  const [brandText, materialsText, countryText] = await Promise.all([
    explainBrand(parsed, scores.brandScore),
    explainMaterials(parsed, scores.materialScore),
    explainCountry(parsed, scores.countryScore),
  ]);
  return { brand: brandText, materials: materialsText, country: countryText };
}

async function explainBrand(parsed: ParsedTag, brandScore: number): Promise<string> {
  if (isUnknownBrand(parsed.brand)) {
    return (
      '**No brand on the tag.** We cannot judge company-level sustainability yet. The brand line uses a neutral default score (50/100) until you add the brand name.'
    );
  }

  const row = await fetchBrandByName(parsed.brand);
  const label = parsed.brand.trim();

  if (!row) {
    return (
      `**${label}** is not in our curated brand list yet. ` +
        `Your score (${brandScore}/100) uses a neutral default until we add research-backed ethics, sustainability, and transparency data in Supabase. ` +
        `Add this brand in the database with a short **notes** field to unlock a real assessment.`
    );
  }

  const parts: string[] = [];
  parts.push(
    `**Overall brand score: ${row.overall_brand_score}/100** (ethics ${row.ethics_score}, sustainability ${row.sustainability_score}, transparency ${row.transparency_score}).`,
  );
  if (row.notes?.trim()) {
    parts.push(row.notes.trim());
  } else {
    parts.push(
      'We have numeric sub-scores but no long-form note yet—add a **notes** field for this brand in Supabase to explain how you judge them.',
    );
  }
  parts.push(`This scan’s brand component is **${brandScore}/100** after blending with the rest of the item.`);
  return parts.join('\n\n');
}

async function explainMaterials(parsed: ParsedTag, materialScore: number): Promise<string> {
  if (missingMaterials(parsed.materials)) {
    return (
      '**No usable fiber list on the tag.** The materials score uses a neutral default (50/100). Add materials (e.g. “60% cotton / 40% polyester”) so we can weight each fiber and show health and sustainability notes.'
    );
  }

  const lines: string[] = [];
  let sumPct = parsed.materials.reduce((a, m) => a + m.percent, 0);
  const list =
    sumPct < 60 || sumPct > 140
      ? parsed.materials.map((m, i, arr) => ({
          ...m,
          percent: 100 / arr.length,
        }))
      : parsed.materials;

  for (const m of list) {
    const pct = Math.round(m.percent);
    const key = normalizeMaterialKey(m.name);
    const display = m.name.trim();
    const row = await fetchMaterialByName(m.name);

    if (!row) {
      lines.push(
        `• **${display} (${pct}%)** — not in our materials table yet; treated as a neutral default in the score. Add **${key}** in Supabase with sustainability and health notes.`,
      );
      continue;
    }

    const bits: string[] = [];
    if (row.sustainability_note?.trim()) bits.push(row.sustainability_note.trim());
    else bits.push(`Sustainability index in DB: ${row.sustainability_score}/100.`);
    if (row.health_note?.trim()) bits.push(`Health / feel: ${row.health_note.trim()}`);
    if (row.quality_score != null) bits.push(`Quality index: ${row.quality_score}/100.`);
    lines.push(`• **${display} (${pct}%)** — ${bits.join(' ')}`);
  }

  const syn = syntheticPercent(parsed.materials);
  if (syn >= 32) {
    lines.push(
      `\n**Synthetic share: ~${Math.round(syn)}%.** Synthetics are durable but are oil-based, shed microfibers in washing, and can feel less breathable than natural fibers for some people. The score already penalizes high synthetic blends.`,
    );
  } else if (syn <= 12 && list.length > 0) {
    lines.push(
      `\n**Mostly natural / low-synthetic blend** — generally better for breathability and biodegradability than all-polyester pieces.`,
    );
  }

  lines.push(`\n**Materials component for this item: ${materialScore}/100.**`);
  return lines.join('\n');
}

async function explainCountry(parsed: ParsedTag, countryScore: number): Promise<string> {
  if (isUnknownCountry(parsed.country)) {
    return (
      '**Country of manufacture unknown.** We cannot apply labor or oversight context. The country line uses a neutral default (50/100) until you add “Made in …”.'
    );
  }

  const row = await fetchCountryByName(parsed.country);
  const place = parsed.country.trim();

  if (!row) {
    return (
      `**${place}** is not in our country table yet. ` +
        `Score (${countryScore}/100) uses a neutral default. Add **${place}** in Supabase with **manufacturing_risk_score** (0–100, higher = more risk) and a **note** explaining labor or governance context.`
    );
  }

  const risk = row.manufacturing_risk_score;
  const parts: string[] = [];
  parts.push(
    `**Made in ${place}.** Manufacturing risk index: **${risk}/100** (higher = more reported labor, safety, or governance concerns). Your country component is **${countryScore}/100** (we invert risk into a sustainability-friendly score).`,
  );
  if (row.note?.trim()) {
    parts.push(row.note.trim());
  } else {
    parts.push(
      'No long-form country note in the database yet—add a **note** in Supabase to spell out what this means for workers (e.g. wage, unions, safety).',
    );
  }
  return parts.join('\n\n');
}

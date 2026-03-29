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

type Scores = {
  brandScore: number;
  materialScore: number;
  materialQualityScore: number;
  countryScore: number;
};

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
    explainMaterials(parsed, scores.materialScore, scores.materialQualityScore),
    explainCountry(parsed, scores.countryScore),
  ]);
  return { brand: brandText, materials: materialsText, country: countryText };
}

/** Brand practices = company ethics / sustainability / transparency from the library (not “reputation” alone). */
async function explainBrand(parsed: ParsedTag, brandScore: number): Promise<string> {
  if (isUnknownBrand(parsed.brand)) {
    return (
      '**No brand on the tag.** The **brand practices** component uses a neutral default (50/100) until you add the brand name. It measures published ethics, sustainability, and transparency signals in our library—not popularity.'
    );
  }

  const row = await fetchBrandByName(parsed.brand);
  const label = parsed.brand.trim();

  if (!row) {
    return (
      `**${label}** is not in our curated brand list yet. ` +
        `Your **brand practices** component (${brandScore}/100) uses a neutral default until we add **${label}** in Supabase with ethics, sustainability, and transparency scores plus notes.`
    );
  }

  const parts: string[] = [];
  parts.push(
    'This is **blended into the headline score**. It is **not** a popularity or marketing score—it reflects published ethics, sustainability, and transparency signals from our library.',
  );
  if (row.notes?.trim()) {
    parts.push(row.notes.trim());
  } else {
    parts.push(
      'No long-form brand note in the database yet—add a **notes** field in Supabase to explain how you judge this label’s practices.',
    );
  }
  return parts.join('\n\n');
}

async function explainMaterials(
  parsed: ParsedTag,
  materialScore: number,
  materialQualityScore: number,
): Promise<string> {
  if (missingMaterials(parsed.materials)) {
    return (
      '**No usable fiber list on the tag.** Sustainability and quality components use a neutral default (50/100) until you add materials (e.g. “60% cotton / 40% polyester”) so we can weight each fiber.'
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

  lines.push(
    `\n**Material side of the score:** fiber **sustainability** ${materialScore}/100 (environmental impact of the blend) and fiber **quality** ${materialQualityScore}/100 (durability / hand-feel in the library). Together with **place of manufacture** and **brand practices**, these feed the headline (fiber sustainability is weighted highest).`,
  );
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

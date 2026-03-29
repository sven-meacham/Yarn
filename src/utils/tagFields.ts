import type { FieldKey, ParsedTag } from '@/src/types/tagParse';

export type { FieldKey };

function isUnknownBrand(s: string): boolean {
  const t = s.trim().toLowerCase();
  return !t || t === 'unknown' || t === 'n/a';
}

function isUnknownCountry(s: string): boolean {
  return isUnknownBrand(s);
}

function isMissingMaterials(materials: ParsedTag['materials']): boolean {
  if (!materials?.length) return true;
  if (materials.length === 1) {
    const n = materials[0].name.trim().toLowerCase();
    if (n === 'unknown' || n === 'n/a') return true;
  }
  return false;
}

export function computeMissingFields(parsed: ParsedTag): Partial<Record<FieldKey, true>> {
  const out: Partial<Record<FieldKey, true>> = {};
  if (isUnknownBrand(parsed.brand)) out.brand = true;
  if (isMissingMaterials(parsed.materials)) out.materials = true;
  if (isUnknownCountry(parsed.country)) out.country = true;
  return out;
}

export function scoreLabel(score: number): 'Good' | 'Fair' | 'Poor' {
  if (score >= 70) return 'Good';
  if (score >= 45) return 'Fair';
  return 'Poor';
}

export function dotColor(score: number): string {
  if (score >= 70) return '#2D5A4A';
  if (score >= 45) return '#B8860B';
  return '#C45C4A';
}

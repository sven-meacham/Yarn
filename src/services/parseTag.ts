import type { ParsedTag } from '@/src/types/tagParse';

/**
 * Heuristic fallback when OpenAI / Edge Function is unavailable.
 * Expects lines like "60% Cotton", "Made in Vietnam", brand on first line.
 */
export function parseTagHeuristic(raw: string): ParsedTag {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const materials: { name: string; percent: number }[] = [];
  let country = '';
  let brand = '';

  const pctRe = /^(\d{1,3})\s*%\s*(.+)$/i;
  const madeInRe = /^made\s+in\s+(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pi = line.match(pctRe);
    if (pi) {
      materials.push({
        percent: Math.min(100, Math.max(0, parseInt(pi[1], 10))),
        name: pi[2].trim(),
      });
      continue;
    }
    const mi = line.match(madeInRe);
    if (mi) {
      country = mi[1].trim();
      continue;
    }
  }

  if (lines.length > 0) {
    const first = lines[0];
    if (!pctRe.test(first) && !madeInRe.test(first)) {
      brand = first;
    }
  }

  if (!brand && lines.length) {
    brand = lines.find((l) => !pctRe.test(l) && !madeInRe.test(l)) ?? '';
  }

  return {
    brand: brand || 'Unknown',
    materials: materials.length ? materials : [{ name: 'unknown', percent: 100 }],
    country: country || 'Unknown',
  };
}

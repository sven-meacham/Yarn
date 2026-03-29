/** Normalize OCR / user text to match `brands.name` rows (lowercase in DB). */
export function normalizeBrandForLookup(raw: string): string {
  let n = raw.trim().toLowerCase();
  n = n.replace(/\s+/g, ' ');
  if (n === 'h&m' || n === 'h & m' || n === 'h and m') return 'hm';
  if (n === "levi's" || n === 'levis') return 'levis';
  if (n === 'j.crew' || n === 'j crew') return 'jcrew';
  if (n.startsWith('the north face')) return 'north face';
  return n;
}

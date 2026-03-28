const SYNONYMS: Record<string, string> = {
  cotton: 'cotton',
  'organic cotton': 'organic cotton',
  'bio cotton': 'organic cotton',
  polyester: 'polyester',
  'recycled polyester': 'recycled polyester',
  rpet: 'recycled polyester',
  nylon: 'nylon',
  polyamide: 'nylon',
  wool: 'wool',
  linen: 'linen',
  hemp: 'hemp',
  elastane: 'elastane',
  spandex: 'elastane',
  lycra: 'elastane',
};

export function normalizeMaterialKey(raw: string): string {
  const n = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s%-]/g, '');
  return SYNONYMS[n] ?? n;
}

import { parseTagHeuristic } from '@/src/services/parseTag';
import type { ParsedTag } from '@/src/types/tagParse';

export type UserDetailFields = {
  brand?: string;
  materialsText?: string;
  country?: string;
};

/**
 * Merge optional user corrections into the parsed tag and re-parse materials if provided.
 */
export function mergeUserDetails(base: ParsedTag, d: UserDetailFields): ParsedTag {
  const brand = (d.brand?.trim() || base.brand || 'Unknown').trim();
  const country = (d.country?.trim() || base.country || 'Unknown').trim();

  let materials = base.materials;
  const mt = d.materialsText?.trim();
  if (mt) {
    const synthetic = `Brand line\n${mt}\nMade in ${country}`;
    const p = parseTagHeuristic(synthetic);
    if (p.materials.length && !(p.materials.length === 1 && p.materials[0].name === 'unknown')) {
      materials = p.materials;
    }
  }

  return { brand, country, materials };
}

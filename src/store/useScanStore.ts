import { create } from 'zustand';

import { buildCategoryExplanations } from '@/src/services/categoryExplanations';
import { computeFullScore } from '@/src/services/score';
import type { FullScanResult, ParsedTag } from '@/src/types/tagParse';
import { computeMissingFields } from '@/src/utils/tagFields';

type ScanState = {
  result: FullScanResult | null;
  setResult: (r: FullScanResult | null) => void;
  updateParsedAndRescore: (parsed: ParsedTag) => Promise<void>;
};

export const useScanStore = create<ScanState>((set, get) => ({
  result: null,
  setResult: (r) => set({ result: r }),
  updateParsedAndRescore: async (parsed: ParsedTag) => {
    const prev = get().result;
    if (!prev) return;
    const scores = await computeFullScore(parsed);
    const categoryExplanations = await buildCategoryExplanations(parsed, scores);
    set({
      result: {
        ...prev,
        parsed,
        brandScore: scores.brandScore,
        materialScore: scores.materialScore,
        countryScore: scores.countryScore,
        overallScore: scores.overallScore,
        countryNote: scores.countryNote,
        brandName: parsed.brand,
        missingFields: computeMissingFields(parsed),
        categoryExplanations,
      },
    });
  },
}));

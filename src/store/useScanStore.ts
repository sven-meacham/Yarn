import { create } from 'zustand';

import type { FullScanResult } from '@/src/types/tagParse';

type ScanState = {
  result: FullScanResult | null;
  setResult: (r: FullScanResult | null) => void;
};

export const useScanStore = create<ScanState>((set) => ({
  result: null,
  setResult: (r) => set({ result: r }),
}));

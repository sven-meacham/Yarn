import { create } from 'zustand';

import { safeGetItem, safeSetItem } from '@/src/storage/safeAsyncStorage';
import type { FullScanResult } from '@/src/types/tagParse';

const KEY = 'yarn-scan-history-v1';
const MAX = 40;

export type ScanHistoryItem = {
  id: string;
  at: number;
  /** Full result for reopening details */
  snapshot: FullScanResult;
};

async function load(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await safeGetItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanHistoryItem[];
  } catch {
    return [];
  }
}

async function save(items: ScanHistoryItem[]) {
  await safeSetItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

type State = {
  items: ScanHistoryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Persists to AsyncStorage — await so the write finishes before navigating away. */
  addFromResult: (snapshot: FullScanResult) => Promise<void>;
};

export const useScanHistoryStore = create<State>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    const items = await load();
    set({ items, hydrated: true });
  },

  addFromResult: async (snapshot: FullScanResult) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: ScanHistoryItem = { id, at: Date.now(), snapshot };
    const next = [item, ...get().items].slice(0, MAX);
    set({ items: next });
    await save(next);
  },
}));

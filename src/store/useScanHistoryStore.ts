import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

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
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanHistoryItem[];
  } catch {
    return [];
  }
}

async function save(items: ScanHistoryItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
}

type State = {
  items: ScanHistoryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addFromResult: (snapshot: FullScanResult) => void;
};

export const useScanHistoryStore = create<State>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: async () => {
    const items = await load();
    set({ items, hydrated: true });
  },

  addFromResult: (snapshot: FullScanResult) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: ScanHistoryItem = { id, at: Date.now(), snapshot };
    const next = [item, ...get().items].slice(0, MAX);
    set({ items: next });
    save(next);
  },
}));

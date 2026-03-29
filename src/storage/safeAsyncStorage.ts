import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/** Session backup when native AsyncStorage is unavailable (e.g. web without bridge, broken link). */
const memoryStore: Record<string, string> = {};

function webGet(key: string): string | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(key);
    }
  } catch {
    /* ignore */
  }
  return memoryStore[key] ?? null;
}

function webSet(key: string, value: string): void {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(key, value);
      return;
    }
  } catch {
    /* fall through */
  }
  memoryStore[key] = value;
}

export async function safeGetItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webGet(key);
  }
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore[key] ?? null;
  }
}

export async function safeSetItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    webSet(key, value);
    return;
  }
  memoryStore[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    /* memory-only for this session */
  }
}

export async function safeRemoveItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        (globalThis as unknown as { localStorage: Storage }).localStorage.removeItem(key);
        return;
      }
    } catch {
      /* ignore */
    }
    delete memoryStore[key];
    return;
  }
  delete memoryStore[key];
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

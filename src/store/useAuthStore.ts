import { create } from 'zustand';

import { safeGetItem, safeRemoveItem, safeSetItem } from '@/src/storage/safeAsyncStorage';

const AUTH_KEY = 'yarn-auth-session-v1';

type AuthState = {
  email: string | null;
  isSignedIn: boolean;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

/**
 * Session persists across restarts (AsyncStorage). Scan history uses a separate key and also persists.
 */
export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  isSignedIn: false,
  bootstrapped: false,

  bootstrap: async () => {
    try {
      const raw = await safeGetItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { email?: string | null };
        if (typeof data.email === 'string' && data.email.trim()) {
          set({ email: data.email.trim(), isSignedIn: true });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    set({ bootstrapped: true });
  },

  signIn: async (email: string) => {
    const trimmed = email.trim();
    set({ email: trimmed, isSignedIn: true });
    await safeSetItem(AUTH_KEY, JSON.stringify({ email: trimmed }));
  },

  signOut: async () => {
    set({ email: null, isSignedIn: false });
    await safeRemoveItem(AUTH_KEY);
  },
}));

import { create } from 'zustand';

/**
 * Hackathon demo: in-memory only — no persistence. Every cold start is signed out
 * so splash → sign-in runs each time you open the app.
 */
type AuthState = {
  email: string | null;
  isSignedIn: boolean;
  bootstrapped: boolean;
  bootstrap: () => void;
  signIn: (email: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  isSignedIn: false,
  bootstrapped: false,

  bootstrap: () => {
    set({ bootstrapped: true });
  },

  signIn: (email: string) => {
    const trimmed = email.trim();
    set({ email: trimmed, isSignedIn: true });
  },

  signOut: () => {
    set({ email: null, isSignedIn: false });
  },
}));

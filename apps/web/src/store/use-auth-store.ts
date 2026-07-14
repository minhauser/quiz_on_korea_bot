'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  hasHydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setHydrated: () => void;
  setSession: (session: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      accessToken: null,
      refreshToken: null,
      user: null,

      setHydrated: () => set({ hasHydrated: true }),

      setSession: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'ksp-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

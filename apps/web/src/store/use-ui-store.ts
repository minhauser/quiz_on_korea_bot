'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  commandOpen: boolean;
  recentQueries: string[];
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  pushRecentQuery: (query: string) => void;
  clearRecentQueries: () => void;
}

const MAX_RECENT = 5;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      commandOpen: false,
      recentQueries: [],
      setCommandOpen: (open) => set({ commandOpen: open }),
      toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),
      pushRecentQuery: (query) =>
        set((s) => {
          const trimmed = query.trim();
          if (trimmed.length < 2) return s;
          const next = [trimmed, ...s.recentQueries.filter((q) => q !== trimmed)].slice(0, MAX_RECENT);
          return { recentQueries: next };
        }),
      clearRecentQueries: () => set({ recentQueries: [] }),
    }),
    {
      name: 'ksp-ui',
      partialize: (s) => ({ recentQueries: s.recentQueries }),
    },
  ),
);

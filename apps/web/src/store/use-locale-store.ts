'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';
import { isLocale, LOCALE_STORAGE_KEY } from '@/i18n/locale-storage';

interface LocaleState {
  locale: Locale;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
  setHydrated: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      hasHydrated: false,
      setLocale: (locale) => set({ locale }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (state && !isLocale(state.locale)) {
          state.setLocale(DEFAULT_LOCALE);
        }
        state?.setHydrated();
      },
    },
  ),
);

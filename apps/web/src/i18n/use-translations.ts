'use client';

import { useCallback } from 'react';

import { useLocaleStore } from '@/store/use-locale-store';

import type { TranslationKey } from './dictionaries';
import { translate, type TranslateParams } from './translate';

export function useTranslations() {
  const locale = useLocaleStore((s) => s.locale);
  const ready = useLocaleStore((s) => s.hasHydrated);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => translate(locale, key, params),
    [locale],
  );

  return { t, locale, ready };
}

'use client';

import * as React from 'react';

import { LOCALE_META } from '@/i18n/config';
import { useLocaleStore } from '@/store/use-locale-store';

function applyDocumentLocale(locale: keyof typeof LOCALE_META) {
  const root = document.documentElement;
  root.lang = locale;
  root.dir = LOCALE_META[locale].dir;
}

/** Keeps `<html lang>` and `dir` in sync with the active locale. */
export function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);
  const ready = useLocaleStore((s) => s.hasHydrated);

  React.useLayoutEffect(() => {
    if (!ready) return;
    applyDocumentLocale(locale);
  }, [locale, ready]);

  return null;
}

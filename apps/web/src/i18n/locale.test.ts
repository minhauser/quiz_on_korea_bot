import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALES } from '@/i18n/config';
import { isLocale, LOCALE_STORAGE_KEY, readStoredLocale } from '@/i18n/locale-storage';
import { translate } from '@/i18n/translate';

describe('isLocale', () => {
  it('accepts supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ko')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe('readStoredLocale', () => {
  it('returns null when storage is empty', () => {
    window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    expect(readStoredLocale()).toBeNull();
  });

  it('reads a persisted locale', () => {
    window.localStorage.setItem(
      LOCALE_STORAGE_KEY,
      JSON.stringify({ state: { locale: 'ko' }, version: 0 }),
    );
    expect(readStoredLocale()).toBe('ko');
  });

  it('ignores invalid persisted values', () => {
    window.localStorage.setItem(
      LOCALE_STORAGE_KEY,
      JSON.stringify({ state: { locale: 'jp' }, version: 0 }),
    );
    expect(readStoredLocale()).toBeNull();
  });
});

describe('translate', () => {
  it('defaults to English strings', () => {
    expect(translate('en', 'language.en')).toBe('English');
  });

  it('returns Korean copy when locale is ko', () => {
    expect(translate('ko', 'nav.dashboard')).toBe('대시보드');
  });

  it('falls back to English for missing keys', () => {
    expect(translate('ko', 'language.en')).toBe('English');
  });

  it('interpolates params', () => {
    expect(translate('en', 'account.level', { level: 3, rank: 'Explorer' })).toBe(
      'Level 3 · Explorer',
    );
  });
});

describe('locale config', () => {
  it('uses English as the default locale', () => {
    expect(DEFAULT_LOCALE).toBe('en');
    expect(LOCALES).toEqual(['en', 'ko']);
  });
});

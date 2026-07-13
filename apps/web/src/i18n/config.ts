export const LOCALES = ['en', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_META: Record<
  Locale,
  {
    labelKey: 'language.en' | 'language.ko';
    shortKey: 'language.enShort' | 'language.koShort';
    /** Native name — used in the switcher and for stable screen-reader labels. */
    nativeLabel: string;
    dir: 'ltr' | 'rtl';
  }
> = {
  en: { labelKey: 'language.en', shortKey: 'language.enShort', nativeLabel: 'English', dir: 'ltr' },
  ko: { labelKey: 'language.ko', shortKey: 'language.koShort', nativeLabel: '한국어', dir: 'ltr' },
};

import type { Locale } from './config';
import { dictionaries } from './dictionaries';
import type { TranslationKey } from './dictionaries';

export type TranslateParams = Record<string, string | number>;

export function translate(locale: Locale, key: TranslationKey, params?: TranslateParams): string {
  let value = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;

  if (params) {
    for (const [name, raw] of Object.entries(params)) {
      value = value.replaceAll(`{${name}}`, String(raw));
    }
  }

  return value;
}

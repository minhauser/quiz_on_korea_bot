import type { Locale } from '../config';
import { en, type TranslationKey } from './en';
import { ko } from './ko';

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  ko,
};

export { en, ko };
export type { TranslationKey } from './en';

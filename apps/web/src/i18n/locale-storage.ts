import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';

/** Zustand persist key — keep in sync with `use-locale-store`. */
export const LOCALE_STORAGE_KEY = 'ksp-locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Reads the persisted locale from localStorage (client-only). */
export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { state?: { locale?: unknown } };
    const locale = parsed.state?.locale;
    return isLocale(locale) ? locale : null;
  } catch {
    return null;
  }
}

/** Inline script applied before React hydrates to avoid a flash of the default locale. */
export const LOCALE_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(LOCALE_STORAGE_KEY)};var d=${JSON.stringify(DEFAULT_LOCALE)};var a=${JSON.stringify([...LOCALES])};var r=localStorage.getItem(k);if(!r)return;var p=JSON.parse(r);var l=p.state&&p.state.locale;if(a.indexOf(l)!==-1)document.documentElement.lang=l;else document.documentElement.lang=d}catch(e){}})();`;

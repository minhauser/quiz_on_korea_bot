'use client';

import { LOCALE_META, LOCALES } from '@/i18n/config';
import { useTranslations } from '@/i18n/use-translations';
import { cn } from '@/shared/lib/utils';
import { useLocaleStore } from '@/store/use-locale-store';

type SwitcherVariant = 'compact' | 'full';

export function LanguageSwitcher({
  variant = 'compact',
  className,
}: {
  /** `compact` shows EN / 한; `full` shows English / Korean. */
  variant?: SwitcherVariant;
  className?: string;
}) {
  const { t, locale, ready } = useTranslations();
  const setLocale = useLocaleStore((s) => s.setLocale);

  const labelKey = variant === 'full' ? 'nativeLabel' : 'shortKey';

  return (
    <div
      role="radiogroup"
      aria-label={t('language.label')}
      aria-busy={!ready}
      className={cn(
        'inline-flex rounded-full border border-border bg-muted/60 p-0.5',
        variant === 'full' ? 'h-9' : 'h-8',
        className,
      )}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        const meta = LOCALE_META[code];
        const optionLabel =
          labelKey === 'nativeLabel' ? meta.nativeLabel : t(meta[labelKey]);

        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={meta.nativeLabel}
            disabled={!ready}
            onClick={() => setLocale(code)}
            className={cn(
              'relative rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-70',
              variant === 'full' ? 'px-3.5 text-xs' : 'min-w-[2.25rem] px-2.5 text-[11px]',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}

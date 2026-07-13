'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { useTranslations } from '@/i18n/use-translations';
import { cn } from '@/shared/lib/utils';

const OPTIONS = [
  { value: 'light', labelKey: 'theme.light', icon: Sun },
  { value: 'dark', labelKey: 'theme.dark', icon: Moon },
  { value: 'system', labelKey: 'theme.system', icon: Monitor },
] as const;

export function ThemeToggle({ placement = 'bottom-end' }: { placement?: 'bottom-end' | 'top-start' }) {
  const { t } = useTranslations();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? 'dark') === 'dark';
  const menuPos = placement === 'top-start' ? 'bottom-12 left-0' : 'right-0 top-12';
  const offset = placement === 'top-start' ? 8 : -8;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('theme.toggle')}
        onClick={() => setOpen((o) => !o)}
        className="relative grid size-10 place-items-center rounded-full bg-muted/60 transition-colors hover:bg-accent"
      >
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? 'moon' : 'sun'}
              initial={{ rotate: -90, opacity: 0, scale: 0.4 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.2 }}
              className="grid place-items-center"
            >
              {isDark ? <Moon className="size-[18px]" /> : <Sun className="size-[18px]" />}
            </motion.span>
          </AnimatePresence>
        ) : (
          <Moon className="size-[18px]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: offset, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: offset, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className={cn(
                'glass absolute z-50 w-40 overflow-hidden rounded-xl border border-border p-1 shadow-2xl',
                menuPos,
              )}
            >
              {OPTIONS.map((opt) => {
                const active = (theme ?? 'system') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setTheme(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
                      active ? 'bg-accent font-semibold' : 'hover:bg-accent/60',
                    )}
                  >
                    <opt.icon className="size-4" />
                    <span className="flex-1 text-left">{t(opt.labelKey)}</span>
                    {active && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

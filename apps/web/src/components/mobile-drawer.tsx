'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTranslations } from '@/i18n/use-translations';
import { NAV, NAV_SECTIONS } from '@/lib/nav';
import { cn, levelFromXp } from '@/shared/lib/utils';
import { useGameStore } from '@/store/use-game-store';
import { useToastStore } from '@/store/use-toast-store';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { totalXp, streak, coins, resetDemo } = useGameStore();
  const toast = useToastStore((s) => s.toast);
  const info = levelFromXp(totalXp);

  // close on route change
  const prevPath = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // lock body scroll while open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* drawer panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col border-r border-border bg-card/95 px-4 py-5 backdrop-blur-md lg:hidden"
          >
            {/* header */}
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <img src="/penguin.png" alt="pAIr logo" className="size-10 rounded-2xl object-contain shadow-lg shadow-primary/30" />
                <div className="leading-tight">
                  <p className="text-sm font-extrabold tracking-tight">{t('common.appName')}</p>
                  <p className="text-[11px] text-muted-foreground">{t('common.tagline')}</p>
                </div>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* user stat pill */}
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-3">
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-black text-white shadow">
                {info.level}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">{info.rank}</p>
                <p className="text-xs text-muted-foreground">{totalXp.toLocaleString()} XP · 🔥 {streak}</p>
              </div>
              <span className="ml-auto text-lg">🚀</span>
            </div>

            {/* nav sections */}
            <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
              {NAV_SECTIONS.map((section) => (
                <div key={section.labelKey}>
                  <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {t(section.labelKey)}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                            active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="mobile-drawer-active"
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30"
                              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            />
                          )}
                          <item.icon className="relative z-10 size-[18px]" />
                          <span className="relative z-10">{t(item.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* footer controls */}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <LanguageSwitcher />
              <ThemeToggle placement="top-start" />
              <button
                onClick={() => {
                  resetDemo();
                  toast({
                    icon: '↺',
                    title: t('account.demoResetTitle'),
                    description: t('account.demoResetDesc'),
                  });
                  onClose();
                }}
                className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <RotateCcw className="size-4" />
                {t('common.resetDemo')}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

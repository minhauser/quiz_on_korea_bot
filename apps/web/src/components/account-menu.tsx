'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Command, LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useTranslations } from '@/i18n/use-translations';
import { useLogout } from '@/shared/api/hooks/use-auth';
import { useMyStats } from '@/shared/api/hooks/use-stats';
import { levelFromXp } from '@/shared/lib/utils';
import { useToastStore } from '@/store/use-toast-store';
import { useUiStore } from '@/store/use-ui-store';

export function AccountMenu() {
  const { t } = useTranslations();
  const router = useRouter();
  const { data: stats } = useMyStats();
  const logout = useLogout();
  const toast = useToastStore((s) => s.toast);
  const setCommandOpen = useUiStore((s) => s.setCommandOpen);
  const [open, setOpen] = React.useState(false);

  const info = levelFromXp(stats?.profile.xp ?? 0);
  const soon = (label: string) =>
    toast({ icon: '✨', title: label, description: t('common.availableSoon') });

  const items = [
    { icon: User, label: t('account.viewProfile'), run: () => soon(t('account.viewProfile')) },
    { icon: Settings, label: t('account.settings'), run: () => soon(t('account.settings')) },
    { icon: Command, label: t('account.commandMenu'), hint: '⌘K', run: () => setCommandOpen(true) },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t('account.menu')}
        onClick={() => setOpen((o) => !o)}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-lg ring-2 ring-transparent transition hover:ring-primary/40"
      >
        🚀
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="glass absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-border p-1.5 shadow-2xl"
            >
              <div className="flex items-center gap-3 px-2.5 py-2">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-lg">
                  🚀
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t('account.you')}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t('account.level', { level: info.level, rank: info.rank })}
                  </p>
                </div>
              </div>
              <div className="my-1 h-px bg-border" />

              {items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    it.run();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <it.icon className="size-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{it.label}</span>
                  {it.hint && <span className="text-xs text-muted-foreground">{it.hint}</span>}
                </button>
              ))}

              <div className="my-1 h-px bg-border" />

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout.mutate(undefined, { onSuccess: () => router.push('/login') });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                <span className="flex-1 text-left">{t('account.logOut')}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

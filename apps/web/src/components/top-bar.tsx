'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Coins, Flame, Gem, Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { LanguageSwitcher } from '@/components/language-switcher';
import { MobileDrawer } from '@/components/mobile-drawer';
import { SearchTrigger } from '@/components/search-trigger';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTranslations } from '@/i18n/use-translations';
import { useMarkNotificationRead, useNotifications } from '@/shared/api/hooks/use-notifications';
import { useMyStats } from '@/shared/api/hooks/use-stats';
import { CountUp } from '@/shared/ui/count-up';
import { cn, levelFromXp } from '@/shared/lib/utils';

function Stat({ icon, value, className }: { icon: React.ReactNode; value: number; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1.5 text-sm font-bold sm:px-3',
        className,
      )}
    >
      {icon}
      <CountUp value={value} />
    </div>
  );
}

export function TopBar() {
  const { t } = useTranslations();
  const { data: stats } = useMyStats();
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const info = levelFromXp(stats?.profile.xp ?? 0);
  const unread = notifications?.unreadCount ?? 0;

  const toggleNotif = () => {
    setNotifOpen((o) => {
      if (!o) {
        notifications?.items.filter((n) => !n.read).forEach((n) => markRead.mutate(n.id));
      }
      return !o;
    });
  };

  return (
    <React.Fragment>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <header className="glass sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border px-3 sm:gap-3 sm:px-4 lg:px-6">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex min-w-0 items-center gap-2 lg:hidden">
          <img src="/penguin.png" alt="pAIr logo" className="size-8 shrink-0 rounded-xl object-contain" />
          <span className="hidden truncate text-sm font-extrabold sm:inline">pAIr</span>
        </Link>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          <SearchTrigger className="hidden w-44 md:flex lg:w-56" />
          <SearchTrigger compact className="md:hidden" />
          <Stat icon={<Flame className="size-4 text-warning" />} value={stats?.profile.streak ?? 0} className="text-warning" />
          <Stat icon={<Gem className="size-4 text-secondary" />} value={stats?.profile.diamonds ?? 0} className="hidden text-secondary md:flex" />
          <Stat icon={<Coins className="size-4 text-amber-400" />} value={stats?.profile.coins ?? 0} className="text-amber-400" />

          <div className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-3 py-1.5 md:flex">
            <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[11px] font-black text-white">
              {info.level}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{info.rank}</span>
          </div>
          <LanguageSwitcher />
          <ThemeToggle placement="bottom-end" />

          <div className="relative">
            <button
              onClick={toggleNotif}
              aria-label={t('topBar.notifications')}
              className="relative grid size-10 place-items-center rounded-full bg-muted/60 transition-colors hover:bg-accent"
            >
              <Bell className="size-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <React.Fragment>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="glass absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border shadow-2xl"
                  >
                    <div className="border-b border-border px-4 py-3 text-sm font-semibold">{t('topBar.notifications')}</div>
                    <div className="max-h-96 overflow-y-auto">
                      {(!notifications || notifications.items.length === 0) && (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t('topBar.allCaughtUp')}</p>
                      )}
                      {notifications?.items.map((n) => (
                        <div key={n.id} className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
                          <span className="text-xl leading-none">
                            {n.type === 'ACHIEVEMENT_UNLOCKED' ? '🏆' : n.type === 'MISSION_REMINDER' ? '🎯' : '✨'}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </React.Fragment>
              )}
            </AnimatePresence>
          </div>

          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-lg">
            🚀
          </span>
        </div>
      </header>
    </React.Fragment>
  );
}

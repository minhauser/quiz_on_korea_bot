'use client';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { NAV } from '@/lib/nav';
import { useTranslations } from '@/i18n/use-translations';
import { useLogout } from '@/shared/api/hooks/use-auth';
import { cn } from '@/shared/lib/utils';

export function AppSidebar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/40 px-4 py-5 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2">
        <img src="/penguin.png" alt="pAIr logo" className="h-10 w-10 rounded-2xl object-contain shadow-lg shadow-primary/30" />
        <div className="leading-tight">
          <p className="text-sm font-extrabold tracking-tight">{t('common.appName')}</p>
          <p className="text-[11px] text-muted-foreground">{t('common.tagline')}</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="relative z-10 size-[18px]" />
              <span className="relative z-10">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle placement="top-start" />
        <button
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.push('/login') })}
          className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

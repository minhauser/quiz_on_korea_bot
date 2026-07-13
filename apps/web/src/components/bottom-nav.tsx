'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV } from '@/lib/nav';
import { useTranslations } from '@/i18n/use-translations';
import { cn } from '@/shared/lib/utils';

export function BottomNav() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const items = NAV.slice(0, 5);

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <item.icon className="size-5" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import { Search } from 'lucide-react';
import * as React from 'react';

import { useTranslations } from '@/i18n/use-translations';
import { cn } from '@/shared/lib/utils';
import { useUiStore } from '@/store/use-ui-store';

function useShortcutLabel() {
  const [label, setLabel] = React.useState('Ctrl K');

  React.useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    setLabel(mac ? '⌘K' : 'Ctrl K');
  }, []);

  return label;
}

export function SearchTrigger({
  className,
  compact = false,
}: {
  className?: string;
  /** Hide placeholder text — icon + shortcut only. */
  compact?: boolean;
}) {
  const { t } = useTranslations();
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={t('search.open')}
      className={cn(
        'flex items-center gap-2 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        compact ? 'size-10 justify-center px-0' : 'h-9 min-w-0 flex-1 max-w-xs px-3 lg:max-w-sm',
        className,
      )}
    >
      <Search className={cn('shrink-0', compact ? 'size-[18px]' : 'size-4')} />
      {!compact && (
        <>
          <span className="hidden min-w-0 flex-1 truncate text-left sm:inline">{t('search.placeholder')}</span>
          <kbd className="hidden shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">
            {shortcut}
          </kbd>
        </>
      )}
    </button>
  );
}

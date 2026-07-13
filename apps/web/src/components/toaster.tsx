'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { useToastStore } from '@/store/use-toast-store';

const accent: Record<string, string> = {
  default: 'border-border',
  success: 'border-success/40',
  xp: 'border-primary/40',
  warning: 'border-warning/40',
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            onClick={() => dismiss(t.id)}
            className={cn(
              'glass pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 text-left shadow-xl',
              accent[t.variant ?? 'default'],
            )}
          >
            {t.icon && <span className="text-xl leading-none">{t.icon}</span>}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              )}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

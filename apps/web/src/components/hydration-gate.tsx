'use client';

import { motion } from 'framer-motion';

import { useTranslations } from '@/i18n/use-translations';
import { useGameStore } from '@/store/use-game-store';
import { useLocaleStore } from '@/store/use-locale-store';

function Splash() {
  const { t } = useTranslations();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-3xl font-black text-white shadow-2xl shadow-primary/40"
      >
        한
      </motion.div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <motion.span
          className="h-2 w-2 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {t('common.loading')}
      </div>
    </div>
  );
}

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const gameReady = useGameStore((s) => s.hasHydrated);
  const localeReady = useLocaleStore((s) => s.hasHydrated);

  if (!gameReady || !localeReady) return <Splash />;
  return <>{children}</>;
}

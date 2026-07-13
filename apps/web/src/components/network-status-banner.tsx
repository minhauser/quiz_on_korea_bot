'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, WifiOff } from 'lucide-react';

import { useNetworkStatus } from '@/hooks/use-network-status';

export function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2.5 bg-destructive px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <WifiOff className="size-4 shrink-0" />
          <span>인터넷 연결이 끊겼습니다. 페이지 기능이 제한될 수 있습니다.</span>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          key="back-online"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2.5 bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>인터넷 연결이 복구되었습니다.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

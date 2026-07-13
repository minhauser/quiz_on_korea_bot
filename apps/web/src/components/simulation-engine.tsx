'use client';

import * as React from 'react';

import { LIVE_NOTIFICATIONS } from '@/lib/mock-data';
import { useGameStore } from '@/store/use-game-store';
import { useToastStore } from '@/store/use-toast-store';

/**
 * Headless component that keeps the demo feeling "alive": the leaderboard drifts
 * and occasional notifications/toasts arrive — all client-side, no backend.
 */
export function SimulationEngine() {
  const hydrated = useGameStore((s) => s.hasHydrated);

  React.useEffect(() => {
    if (!hydrated) return;
    const tick = useGameStore.getState().tickLeaderboard;
    const push = useGameStore.getState().pushNotification;
    const toast = useToastStore.getState().toast;

    const lbInterval = setInterval(() => tick(), 7000);

    let idx = 0;
    const notifInterval = setInterval(() => {
      const n = LIVE_NOTIFICATIONS[idx % LIVE_NOTIFICATIONS.length];
      idx += 1;
      if (!n) return;
      push(n);
      toast({ icon: n.icon, title: n.title, description: n.body });
    }, 16000);

    return () => {
      clearInterval(lbInterval);
      clearInterval(notifInterval);
    };
  }, [hydrated]);

  return null;
}

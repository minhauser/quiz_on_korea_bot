'use client';

import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';

import { useDailyMissions } from '@/shared/api/hooks/use-gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';

const MISSION_ICONS: Record<string, string> = {
  'Learn 15 new words': '📚',
  'Complete 1 lesson': '🎯',
  'Score 90%+ on a quiz': '⚡',
  'Keep your streak alive': '🔥',
};

export function DailyMissions() {
  const { data: missions, isLoading } = useDailyMissions();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Daily Missions</CardTitle>
        <span className="text-xs font-medium text-muted-foreground">Resets at midnight</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {missions?.map((m) => {
          const pct = Math.min(100, (m.progress / m.goal) * 100);

          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-xl">
                {MISSION_ICONS[m.title] ?? '🎯'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Coins className="size-3.5" />
                    {m.rewardCoins > 0 ? m.rewardCoins : m.rewardXp}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        m.completed ? 'bg-success' : 'bg-gradient-to-r from-primary to-secondary',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] text-muted-foreground">
                    {Math.min(m.progress, m.goal)}/{m.goal}
                  </span>
                </div>
              </div>
              {m.completed && (
                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                  <Check className="size-4" /> Done
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

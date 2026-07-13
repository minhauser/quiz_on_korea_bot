'use client';

import { motion } from 'framer-motion';
import { Check, Coins } from 'lucide-react';

import { DAILY_MISSIONS } from '@/lib/mock-data';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { useGameStore } from '@/store/use-game-store';
import { useToastStore } from '@/store/use-toast-store';

export function DailyMissions() {
  const progress = useGameStore((s) => s.missionProgress);
  const claimed = useGameStore((s) => s.claimedMissions);
  const claimMission = useGameStore((s) => s.claimMission);
  const toast = useToastStore((s) => s.toast);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Daily Missions</CardTitle>
        <span className="text-xs font-medium text-muted-foreground">Resets in 6h 12m</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {DAILY_MISSIONS.map((m) => {
          const value = progress[m.id] ?? 0;
          const done = value >= m.goal;
          const isClaimed = claimed.includes(m.id);
          const pct = Math.min(100, (value / m.goal) * 100);

          return (
            <div key={m.id} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-xl">
                {m.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Coins className="size-3.5" />
                    {m.reward}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        done ? 'bg-success' : 'bg-gradient-to-r from-primary to-secondary',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                  <span className="w-10 text-right text-[11px] text-muted-foreground">
                    {Math.min(value, m.goal)}/{m.goal}
                  </span>
                </div>
              </div>
              {isClaimed ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-success">
                  <Check className="size-4" /> Claimed
                </span>
              ) : (
                <Button
                  size="sm"
                  variant={done ? 'success' : 'secondary'}
                  disabled={!done}
                  onClick={() => {
                    claimMission(m.id, m.reward);
                    toast({ variant: 'success', icon: '🪙', title: `+${m.reward} coins`, description: m.title });
                  }}
                >
                  Claim
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

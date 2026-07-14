'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import { useAchievements } from '@/shared/api/hooks/use-achievements';
import { cn } from '@/shared/lib/utils';

export default function AchievementsPage() {
  const { data: items, isLoading } = useAchievements();

  const unlockedCount = items?.filter((a) => a.unlocked).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Achievements</h1>
        <p className="mt-1 text-muted-foreground">
          {items ? `${unlockedCount} of ${items.length} unlocked — keep going to collect them all.` : 'Loading…'}
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading achievements…</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-5',
              !a.unlocked && 'opacity-60',
            )}
          >
            <span
              className={cn(
                'grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg sm:size-16 sm:text-3xl',
                a.unlocked ? 'from-amber-400 to-orange-500' : 'from-muted to-muted',
              )}
            >
              {a.unlocked ? (a.icon ?? '🏆') : <Lock className="size-6 text-muted-foreground" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{a.title}</h3>
                {a.unlocked && (
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-500">
                    +{a.xpReward} XP
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

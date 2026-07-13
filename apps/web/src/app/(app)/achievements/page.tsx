'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import { ACHIEVEMENTS } from '@/lib/mock-data';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useGameStore } from '@/store/use-game-store';

const rarityRing: Record<string, string> = {
  Common: 'from-slate-400 to-slate-500',
  Rare: 'from-sky-400 to-blue-500',
  Epic: 'from-fuchsia-500 to-purple-600',
  Legendary: 'from-amber-400 to-orange-500',
};

const rarityBadge: Record<string, 'muted' | 'default' | 'secondary' | 'warning'> = {
  Common: 'muted',
  Rare: 'default',
  Epic: 'secondary',
  Legendary: 'warning',
};

export default function AchievementsPage() {
  const completed = useGameStore((s) => s.completedLessons);
  const lessonResults = useGameStore((s) => s.lessonResults);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const userRank = leaderboard.findIndex((p) => p.isUser);

  const items = ACHIEVEMENTS.map((a) => {
    if (a.id === 'a2')
      return { ...a, unlocked: ['arrival-airport', 'dorm-checkin'].every((id) => completed.includes(id)) };
    if (a.id === 'a4')
      return {
        ...a,
        unlocked: Object.values(lessonResults).filter((r) => r.bestAccuracy === 100).length >= 5,
      };
    if (a.id === 'a6') return { ...a, unlocked: userRank === 0 };
    return a;
  });

  const unlockedCount = items.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Achievements</h1>
        <p className="mt-1 text-muted-foreground">
          {unlockedCount} of {items.length} unlocked — keep going to collect them all.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
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
                a.unlocked ? rarityRing[a.rarity] : 'from-muted to-muted',
              )}
            >
              {a.unlocked ? a.icon : <Lock className="size-6 text-muted-foreground" />}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{a.title}</h3>
                <Badge variant={rarityBadge[a.rarity]}>{a.rarity}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

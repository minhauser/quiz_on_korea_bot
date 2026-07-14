'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { CountUp } from '@/shared/ui/count-up';
import { cn } from '@/shared/lib/utils';
import type { LeaderboardEntry } from '@/shared/api/hooks/use-stats';

const medal = ['🥇', '🥈', '🥉'];

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  limit?: number;
}

export function LeaderboardList({ entries, limit }: LeaderboardListProps) {
  const rows = limit ? entries.slice(0, limit) : entries;

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No rankings yet — start earning XP!</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {rows.map((p, i) => (
          <motion.div
            key={p.userId}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 }, delay: i * 0.03 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5',
              p.isCurrentUser
                ? 'border-primary/40 bg-gradient-to-r from-primary/10 to-secondary/10'
                : 'border-transparent bg-muted/40',
            )}
          >
            <span className="w-7 shrink-0 text-center text-sm font-bold">
              {p.rank <= 3 ? medal[p.rank - 1] : <span className="text-muted-foreground">{p.rank}</span>}
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-lg">
              {p.avatar ?? '🚀'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {p.nickname} {p.isCurrentUser && <span className="text-primary">(You)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">Level {p.currentLevel}{p.country ? ` · ${p.country}` : ''}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">
                <CountUp value={p.xp} format /> <span className="text-xs font-normal text-muted-foreground">XP</span>
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

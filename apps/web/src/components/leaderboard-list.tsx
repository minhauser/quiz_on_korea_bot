'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { CountUp } from '@/shared/ui/count-up';
import { cn } from '@/shared/lib/utils';
import type { Player } from '@/lib/mock-data';

const medal = ['🥇', '🥈', '🥉'];

interface LeaderboardListProps {
  players: Player[];
  limit?: number;
}

export function LeaderboardList({ players, limit }: LeaderboardListProps) {
  const rows = limit ? players.slice(0, limit) : players;

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {rows.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 }, delay: i * 0.03 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border px-3 py-2.5',
              p.isUser
                ? 'border-primary/40 bg-gradient-to-r from-primary/10 to-secondary/10'
                : 'border-transparent bg-muted/40',
            )}
          >
            <span className="w-7 shrink-0 text-center text-sm font-bold">
              {i < 3 ? medal[i] : <span className="text-muted-foreground">{i + 1}</span>}
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-lg">{p.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {p.name} {p.isUser && <span className="text-primary">(You)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {p.flag} {p.country} · {p.university}
              </p>
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

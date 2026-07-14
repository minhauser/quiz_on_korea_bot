'use client';

import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';

import { LeaderboardList } from '@/components/leaderboard-list';
import { useLeaderboard } from '@/shared/api/hooks/use-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn, formatNumber } from '@/shared/lib/utils';

const TABS = ['alltime', 'weekly'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  alltime: '🌍 Global',
  weekly: '📅 This week',
};

export default function LeaderboardPage() {
  const [tab, setTab] = React.useState<Tab>('alltime');
  const { data, isLoading } = useLeaderboard(tab);

  const entries = data?.entries ?? [];
  const myEntry = entries.find((e) => e.isCurrentUser);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:gap-3 sm:text-3xl">
            Leaderboard
            <span className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              <motion.span
                className="size-1.5 rounded-full bg-success"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              Live
            </span>
          </h1>
          <p className="mt-1 text-muted-foreground">Compete with international students worldwide.</p>
        </div>
      </div>

      {data?.me.rank && (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <Card className="overflow-hidden bg-gradient-to-r from-primary/15 to-secondary/15">
              <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                <span className="grid size-11 place-items-center rounded-2xl bg-card text-xl sm:size-14 sm:text-2xl">
                  {myEntry?.avatar ?? '🚀'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Your rank</p>
                  <p className="text-2xl font-black">
                    #{data.me.rank} <span className="text-base font-semibold text-muted-foreground">of {entries.length}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-gradient">{formatNumber(data.me.xp)}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
              tab === t ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab === t && (
              <motion.span
                layoutId="lb-tab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-secondary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{TAB_LABELS[t]}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{tab === 'alltime' ? 'Global ranking' : 'This week’s ranking'}</CardTitle>
          <span className="text-xs text-muted-foreground">{entries.length} students</span>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <LeaderboardList entries={entries} />
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

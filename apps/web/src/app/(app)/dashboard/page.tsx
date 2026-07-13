'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookCheck, Flame, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

import { BarChart } from '@/components/charts/bar-chart';
import { DailyMissions } from '@/components/daily-missions';
import { LeaderboardList } from '@/components/leaderboard-list';
import { StatCard } from '@/components/stat-card';
import { LESSONS, WEEKLY_XP } from '@/lib/mock-data';
import { useGameStore } from '@/store/use-game-store';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CountUp } from '@/shared/ui/count-up';
import { levelFromXp } from '@/shared/lib/utils';

export default function DashboardPage() {
  const { totalXp, streak, wordsLearned, completedLessons, lessonResults, isUnlocked, setActiveLesson, leaderboard } =
    useGameStore();

  const level = levelFromXp(totalXp);
  const next =
    LESSONS.find((l) => !completedLessons.includes(l.id) && isUnlocked(l.id)) ??
    LESSONS[LESSONS.length - 1]!;
  const accs = Object.values(lessonResults).map((r) => r.bestAccuracy);
  const avgAccuracy = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-secondary/15 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm text-muted-foreground">안녕하세요, future scholar 👋</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Level {level.level} · <span className="text-gradient">{level.rank}</span>
            </h1>
            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <CountUp value={level.intoLevel} /> / {level.span} XP
                </span>
                <span>{level.span - level.intoLevel} XP to Level {level.level + 1}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${level.progress * 100}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />
              </div>
            </div>
          </div>
          <Button
            variant="gradient"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setActiveLesson(next.id)}
          >
            Continue learning <ArrowRight className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard icon={<Sparkles className="size-5" />} label="Words learned" value={wordsLearned} index={0} accent="from-primary to-secondary" />
        <StatCard icon={<Flame className="size-5" />} label="Day streak" value={streak} index={1} accent="from-amber-500 to-orange-500" />
        <StatCard icon={<BookCheck className="size-5" />} label="Lessons done" value={completedLessons.length} index={2} accent="from-emerald-500 to-teal-500" />
        <StatCard icon={<Target className="size-5" />} label="Avg accuracy" value={avgAccuracy} suffix="%" index={3} accent="from-fuchsia-500 to-pink-500" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Continue learning */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Continue learning</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => setActiveLesson(next.id)}
                className="group flex w-full items-center gap-4 rounded-2xl bg-muted/40 p-4 text-left transition-colors hover:bg-accent"
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg sm:size-16 sm:text-4xl ${next.accent}`}>
                  {next.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{next.chapter}</p>
                  <p className="truncate text-lg font-bold">{next.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{next.scenario}</p>
                </div>
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white transition-transform group-hover:scale-110">
                  <ArrowRight className="size-5" />
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Weekly XP */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>This week&apos;s XP</CardTitle>
              <span className="text-sm font-bold text-gradient">
                {WEEKLY_XP.reduce((a, b) => a + b.xp, 0)} XP
              </span>
            </CardHeader>
            <CardContent>
              <BarChart data={WEEKLY_XP.map((d) => ({ label: d.day, value: d.xp }))} />
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <DailyMissions />
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Leaderboard</CardTitle>
              <Link href="/leaderboard" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <LeaderboardList players={leaderboard} limit={5} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

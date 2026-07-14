'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Signal, WifiOff } from 'lucide-react';
import * as React from 'react';

import { BarChart } from '@/components/charts/bar-chart';
import { Heatmap } from '@/components/charts/heatmap';
import { MasteryBars } from '@/components/charts/mastery-bars';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useMyStats, type DailyActivity } from '@/shared/api/hooks/use-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { CircularProgress } from '@/shared/ui/circular-progress';
import { CountUp } from '@/shared/ui/count-up';
import { cn } from '@/shared/lib/utils';

type ViewMode = 'online' | 'offline';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HEATMAP_WEEKS = 16;

function buildHeatmapGrid(activity: DailyActivity[]): number[][] {
  const byDate = new Map(activity.map((a) => [a.date.slice(0, 10), a.xpEarned]));
  const today = new Date();
  const days: number[] = [];
  for (let i = HEATMAP_WEEKS * 7 - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const xp = byDate.get(key) ?? 0;
    days.push(Math.max(0, Math.min(4, Math.round(xp / 50))));
  }
  const grid: number[][] = [];
  for (let w = 0; w < HEATMAP_WEEKS; w += 1) {
    grid.push(days.slice(w * 7, w * 7 + 7));
  }
  return grid;
}

function buildWeeklyXp(activity: DailyActivity[]): { label: string; value: number }[] {
  const byDate = new Map(activity.map((a) => [a.date.slice(0, 10), a.xpEarned]));
  const today = new Date();
  const result: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ label: WEEKDAY_LABELS[d.getDay()] ?? '', value: byDate.get(key) ?? 0 });
  }
  return result;
}

function OfflineState({ onRetry }: { onRetry: () => void }) {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 1800);
    onRetry();
  };

  return (
    <motion.div
      key="offline-state"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-6 py-16 text-center"
    >
      <div className="relative">
        <motion.div
          className="grid size-24 place-items-center rounded-3xl bg-destructive/10"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WifiOff className="size-10 text-destructive/70" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-destructive/30"
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black">인터넷 연결이 없습니다</h2>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          통계 데이터를 불러오려면 인터넷 연결이 필요합니다.
          <br />
          연결 상태를 확인한 후 다시 시도해 주세요.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2 rounded-2xl border border-border bg-muted/40 p-4 text-left">
        {['Wi-Fi 또는 모바일 데이터를 확인하세요', '비행기 모드가 꺼져 있는지 확인하세요', '라우터를 재시작해 보세요'].map(
          (tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
              <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold">
                {i + 1}
              </span>
              {tip}
            </div>
          ),
        )}
      </div>

      <button
        onClick={handleRetry}
        disabled={retrying}
        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-60"
      >
        <RefreshCw className={cn('size-4', retrying && 'animate-spin')} />
        {retrying ? '연결 확인 중…' : '다시 시도'}
      </button>

      <p className="text-xs text-muted-foreground/60">마지막 동기화: 방금 전</p>
    </motion.div>
  );
}

function DataState() {
  const { data: stats, isLoading } = useMyStats();

  if (isLoading || !stats) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Loading stats…</p>;
  }

  const weeklyXp = buildWeeklyXp(stats.heatmap);
  const grid = buildHeatmapGrid(stats.heatmap);
  const totalWeeklyXp = weeklyXp.reduce((a, b) => a + b.value, 0);
  const retention =
    stats.statistics.wordsLearned > 0
      ? Math.round((stats.statistics.wordsMastered / stats.statistics.wordsLearned) * 100)
      : 0;

  return (
    <motion.div
      key="data-state"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly XP</CardTitle>
            <span className="text-sm font-bold text-gradient">{totalWeeklyXp} XP</span>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyXp} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Skill mastery</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryMastery.length > 0 ? (
              <MasteryBars data={stats.categoryMastery} />
            ) : (
              <p className="text-sm text-muted-foreground">Complete some lessons to see your mastery breakdown.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap grid={grid} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consistency</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <CircularProgress value={retention / 100} size={120} stroke={10}>
              <div className="text-center">
                <p className="text-2xl font-black">{retention}%</p>
                <p className="text-[10px] text-muted-foreground">mastered</p>
              </div>
            </CircularProgress>
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-lg font-black">
                  <CountUp value={stats.statistics.wordsLearned} />
                </p>
                <p className="text-[11px] text-muted-foreground">words</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-lg font-black text-warning">
                  <CountUp value={stats.profile.streak} />🔥
                </p>
                <p className="text-[11px] text-muted-foreground">day streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default function StatsPage() {
  const { isOnline } = useNetworkStatus();
  const [preview, setPreview] = React.useState<ViewMode>('online');
  const [retryCount, setRetryCount] = React.useState(0);

  const effectiveMode: ViewMode = isOnline ? preview : 'offline';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Statistics</h1>
          <p className="mt-1 text-muted-foreground">Track your progress and find your weak spots.</p>
        </div>

        {isOnline && (
          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 sm:inline">
              Dev preview
            </span>
            <div className="relative inline-flex items-center rounded-lg border border-border bg-muted/50 p-1 shadow-sm">
              <motion.span
                className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-background shadow-sm"
                animate={{
                  left: preview === 'offline' ? 'calc(50% + 2px)' : '4px',
                  width: 'calc(50% - 6px)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
              <button
                onClick={() => setPreview('online')}
                className={cn(
                  'relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  preview === 'online' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Signal className="size-3.5" />
                정상
              </button>
              <button
                onClick={() => setPreview('offline')}
                className={cn(
                  'relative z-10 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  preview === 'offline' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <WifiOff className="size-3.5" />
                오프라인
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <WifiOff className="size-4 shrink-0" />
              실제 인터넷 연결이 끊겼습니다. 오프라인 상태가 표시됩니다.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {effectiveMode === 'offline' ? (
          <OfflineState key={`offline-${retryCount}`} onRetry={() => setRetryCount((c) => c + 1)} />
        ) : (
          <DataState key="data" />
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { LessonCard } from '@/components/lesson-card';
import { LESSONS } from '@/lib/mock-data';
import { Progress } from '@/shared/ui/progress';
import { useGameStore } from '@/store/use-game-store';

export default function LearnPage() {
  const completed = useGameStore((s) => s.completedLessons);
  const worlds = Array.from(new Set(LESSONS.map((l) => l.world)));
  const pct = Math.round((completed.length / LESSONS.length) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Learning Map</h1>
        <p className="mt-1 text-muted-foreground">
          Your journey from arrival to graduation in South Korea.
        </p>
        <div className="mt-4 max-w-full sm:max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="font-semibold text-muted-foreground">
              {completed.length}/{LESSONS.length} lessons
            </span>
          </div>
          <Progress value={pct} />
        </div>
      </div>

      {worlds.map((world) => {
        const lessons = LESSONS.filter((l) => l.world === world);
        const done = lessons.filter((l) => completed.includes(l.id)).length;
        return (
          <section key={world}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold">{world}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {done}/{lessons.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

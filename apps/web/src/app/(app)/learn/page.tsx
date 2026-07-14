'use client';

import { LessonCard } from '@/components/lesson-card';
import { useLessons } from '@/shared/api/hooks/use-lessons';
import { Progress } from '@/shared/ui/progress';

export default function LearnPage() {
  const { data: lessons, isLoading } = useLessons();

  if (isLoading || !lessons) {
    return <div className="py-16 text-center text-muted-foreground">Loading lessons…</div>;
  }

  const completedCount = lessons.filter((l) => l.progress?.completedAt).length;
  const worlds = Array.from(new Set(lessons.map((l) => l.category.parent?.name ?? l.category.name)));
  const pct = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

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
              {completedCount}/{lessons.length} lessons
            </span>
          </div>
          <Progress value={pct} />
        </div>
      </div>

      {worlds.map((world) => {
        const worldLessons = lessons.filter((l) => (l.category.parent?.name ?? l.category.name) === world);
        const done = worldLessons.filter((l) => l.progress?.completedAt).length;
        return (
          <section key={world}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold">{world}</h2>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {done}/{worldLessons.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {worldLessons.map((lesson, i) => (
                <LessonCard key={lesson.id} lesson={lesson} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

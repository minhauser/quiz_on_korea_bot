'use client';

import { motion } from 'framer-motion';
import { Check, Lock, Play, Star } from 'lucide-react';

import { lessonAccent, lessonIcon } from '@/lib/lesson-presentation';
import type { LessonSummary } from '@/shared/api/hooks/use-lessons';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useLessonPlayerStore } from '@/store/use-lesson-player-store';

const diffVariant = {
  BEGINNER: 'success',
  INTERMEDIATE: 'warning',
  ADVANCED: 'destructive',
} as const;

const diffLabel = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export function LessonCard({ lesson, index = 0 }: { lesson: LessonSummary; index?: number }) {
  const setActiveLesson = useLessonPlayerStore((s) => s.setActiveLesson);

  const unlocked = lesson.unlocked;
  const completed = !!lesson.progress?.completedAt;
  const best = lesson.progress?.score ?? 0;
  const stars = completed ? (best === 100 ? 3 : best >= 80 ? 2 : 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={unlocked ? { y: -4 } : undefined}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm',
        !unlocked && 'opacity-70',
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg',
            lessonAccent(lesson.id),
          )}
        >
          {unlocked ? lessonIcon(lesson.id) : <Lock className="size-6 text-white" />}
        </div>
        <Badge variant={diffVariant[lesson.difficulty]}>{diffLabel[lesson.difficulty]}</Badge>
      </div>

      <h3 className="mt-4 text-lg font-bold">{lesson.title}</h3>
      <p className="text-sm text-muted-foreground">{lesson.description}</p>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>📚 {lesson.vocabularyCount} words</span>
        <span>⚡ {lesson.xpReward} XP</span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-5">
        {completed ? (
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                className={cn('size-4', i < stars ? 'fill-amber-400 text-amber-400' : 'text-muted')}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{unlocked ? 'Ready' : 'Locked'}</span>
        )}

        {!unlocked ? (
          <Button variant="secondary" size="sm" disabled>
            <Lock className="size-4" /> Locked
          </Button>
        ) : completed ? (
          <Button variant="outline" size="sm" onClick={() => setActiveLesson(lesson.id)}>
            <Check className="size-4" /> Review
          </Button>
        ) : (
          <Button variant="gradient" size="sm" onClick={() => setActiveLesson(lesson.id)}>
            <Play className="size-4" /> Start
          </Button>
        )}
      </div>
    </motion.div>
  );
}

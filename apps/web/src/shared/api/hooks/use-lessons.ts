'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/client';
import { useAuthStore } from '@/store/use-auth-store';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface LessonCategory {
  id: string;
  name: string;
  parentCategoryId: string | null;
  parent: { id: string; name: string } | null;
}

export interface LessonProgress {
  completedAt: string | null;
  completion: number;
  score: number | null;
  mastery: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  estimatedTime: number;
  xpReward: number;
  unlockLevel: number;
  order: number;
  category: LessonCategory;
  vocabularyCount: number;
  unlocked: boolean;
  progress: LessonProgress | null;
}

export interface CompletedMission {
  id: string;
  title: string;
  rewardXp: number;
  rewardCoins: number;
}

export interface UnlockedAchievement {
  id: string;
  title: string;
  icon: string | null;
  xpReward: number;
}

export interface CompleteLessonResult {
  xpAwarded: number;
  coinsAwarded: number;
  firstCompletion: boolean;
  completedMissions: CompletedMission[];
  unlockedAchievements: UnlockedAchievement[];
}

export function useLessons() {
  const hasSession = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: ['lessons'],
    queryFn: () => api.get<LessonSummary[]>('/lessons'),
    enabled: hasSession,
  });
}

export interface LessonExampleSentence {
  sentenceKo: string;
  translation: string;
}

export interface LessonVocabularyWord {
  id: string;
  word: string;
  romanization: string | null;
  translation: string;
  exampleSentences: LessonExampleSentence[];
}

export interface LessonDetail {
  id: string;
  title: string;
  xpReward: number;
  vocabulary: LessonVocabularyWord[];
  progress: LessonProgress | null;
}

export function useLesson(lessonId: string | null) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => api.get<LessonDetail>(`/lessons/${lessonId}`),
    enabled: !!lessonId,
  });
}

export function useStartLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => api.post(`/lessons/${lessonId}/start`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, score }: { lessonId: string; score: number }) =>
      api.post<CompleteLessonResult>(`/lessons/${lessonId}/complete`, { score }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

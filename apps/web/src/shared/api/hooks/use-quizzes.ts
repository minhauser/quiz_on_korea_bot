'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/client';
import type { CompletedMission, UnlockedAchievement } from '@/shared/api/hooks/use-lessons';

export interface QuizOption {
  id: string;
  text: string;
  order: number;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string | null;
  explanation: string | null;
  difficulty: string;
  xpReward: number;
  options: QuizOption[];
}

export interface QuizTemplate {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface QuizAnswerInput {
  questionId: string;
  optionId?: string;
  textAnswer?: string;
}

export interface QuizQuestionResult {
  questionId: string;
  correct: boolean;
  xpReward: number;
  correctOptionId?: string;
  explanation: string | null;
}

export interface QuizAttemptResult {
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  coinsEarned: number;
  results: QuizQuestionResult[];
  completedMissions: CompletedMission[];
  unlockedAchievements: UnlockedAchievement[];
}

export function useLessonQuizzes(lessonId: string | null) {
  return useQuery({
    queryKey: ['quizzes', lessonId],
    queryFn: () => api.get<QuizTemplate[]>(`/quizzes/${lessonId}`),
    enabled: !!lessonId,
  });
}

export function useAttemptQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      answers,
      durationSeconds,
    }: {
      quizId: string;
      answers: QuizAnswerInput[];
      durationSeconds: number;
    }) => api.post<QuizAttemptResult>(`/quizzes/${quizId}/attempt`, { answers, durationSeconds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'daily'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

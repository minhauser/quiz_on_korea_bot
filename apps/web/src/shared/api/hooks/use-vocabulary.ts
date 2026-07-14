'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/client';

export interface ExampleSentence {
  id: string;
  sentenceKo: string;
  translation: string;
  audio: string | null;
}

export interface VocabularyWord {
  id: string;
  word: string;
  romanization: string | null;
  translation: string;
  pronunciation: string | null;
  exampleSentences: ExampleSentence[];
  progress: { masteryLevel: number; timesSeen: number } | null;
}

export function useVocabulary(lessonId: string | null) {
  return useQuery({
    queryKey: ['vocabulary', lessonId],
    queryFn: () => api.get<VocabularyWord[]>(`/vocabulary/${lessonId}`),
    enabled: !!lessonId,
  });
}

export function useReviewVocabulary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, correct }: { wordId: string; correct: boolean }) =>
      api.post(`/vocabulary/${wordId}/review`, { correct }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['missions', 'daily'] });
    },
  });
}

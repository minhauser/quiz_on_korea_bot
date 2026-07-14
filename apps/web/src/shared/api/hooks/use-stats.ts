'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/client';

export interface Statistics {
  studyMinutes: number;
  wordsLearned: number;
  wordsMastered: number;
  lessonsCompleted: number;
  accuracy: number;
  totalXp: number;
  loginDays: number;
}

export interface ProfileStats {
  xp: number;
  coins: number;
  diamonds: number;
  streak: number;
  longestStreak: number;
  currentLevel: number;
}

export interface DailyActivity {
  date: string;
  xpEarned: number;
  studyMinutes: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  wordsLearned: number;
}

export interface CategoryMastery {
  label: string;
  value: number;
}

export interface MyStats {
  statistics: Statistics;
  profile: ProfileStats;
  heatmap: DailyActivity[];
  categoryMastery: CategoryMastery[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  xp: number;
  nickname: string;
  avatar: string | null;
  currentLevel: number;
  country: string | null;
  isCurrentUser: boolean;
}

export interface LeaderboardResult {
  period: 'alltime' | 'weekly';
  entries: LeaderboardEntry[];
  me: { rank: number | null; xp: number };
}

export function useMyStats() {
  return useQuery({
    queryKey: ['stats', 'me'],
    queryFn: () => api.get<MyStats>('/stats/me'),
  });
}

export function useLeaderboard(period: 'alltime' | 'weekly' = 'alltime') {
  return useQuery({
    queryKey: ['stats', 'leaderboard', period],
    queryFn: () => api.get<LeaderboardResult>(`/stats/leaderboard?period=${period}`),
  });
}

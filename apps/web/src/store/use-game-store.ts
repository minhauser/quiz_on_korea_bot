'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LEADERBOARD_SEED, LESSONS, type Player } from '@/lib/mock-data';
import { uid } from '@/shared/lib/utils';

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  read: boolean;
  ts: number;
}

interface LessonResult {
  completed: boolean;
  bestAccuracy: number;
}

interface GameState {
  hasHydrated: boolean;
  totalXp: number;
  coins: number;
  gems: number;
  streak: number;
  wordsLearned: number;
  completedLessons: string[];
  lessonResults: Record<string, LessonResult>;
  missionProgress: Record<string, number>;
  claimedMissions: string[];
  leaderboard: Player[];
  notifications: AppNotification[];
  activeLessonId: string | null;

  // derived helper
  isUnlocked: (lessonId: string) => boolean;

  // actions
  setHydrated: () => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  setActiveLesson: (id: string | null) => void;
  completeLesson: (lessonId: string, accuracy: number) => void;
  progressMission: (id: string, by: number) => void;
  claimMission: (id: string, reward: number) => void;
  pushNotification: (n: Omit<AppNotification, 'id' | 'read' | 'ts'>) => void;
  markAllRead: () => void;
  tickLeaderboard: () => void;
  resetDemo: () => void;
}

const initialLeaderboard = (): Player[] =>
  [...LEADERBOARD_SEED].sort((a, b) => b.xp - a.xp);

const INITIAL = {
  totalXp: 4290,
  coins: 1240,
  gems: 18,
  streak: 12,
  wordsLearned: 96,
  completedLessons: ['arrival-airport', 'dorm-checkin'],
  lessonResults: {
    'arrival-airport': { completed: true, bestAccuracy: 100 },
    'dorm-checkin': { completed: true, bestAccuracy: 92 },
  } as Record<string, LessonResult>,
  missionProgress: { m1: 8, m2: 0, m3: 0, m4: 1 } as Record<string, number>,
  claimedMissions: [] as string[],
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      ...INITIAL,
      leaderboard: initialLeaderboard(),
      notifications: [
        { id: uid('n'), icon: '🔥', title: 'Welcome back!', body: 'Your 12-day streak is still alive.', read: false, ts: Date.now() - 60_000 },
        { id: uid('n'), icon: '✨', title: 'New lesson unlocked', body: '“Campus Orientation” is ready for you.', read: false, ts: Date.now() - 3_600_000 },
      ],
      activeLessonId: null,

      isUnlocked: (lessonId) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) return false;
        if (lesson.order === 1) return true;
        const prev = LESSONS.find((l) => l.order === lesson.order - 1);
        return prev ? get().completedLessons.includes(prev.id) : true;
      },

      setHydrated: () => set({ hasHydrated: true }),

      addXp: (amount) =>
        set((s) => ({
          totalXp: s.totalXp + amount,
          leaderboard: s.leaderboard
            .map((p) => (p.isUser ? { ...p, xp: p.xp + amount } : p))
            .sort((a, b) => b.xp - a.xp),
        })),

      addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

      setActiveLesson: (id) => set({ activeLessonId: id }),

      completeLesson: (lessonId, accuracy) => {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (!lesson) return;
        const s = get();
        const prevBest = s.lessonResults[lessonId]?.bestAccuracy ?? 0;
        const firstTime = !s.completedLessons.includes(lessonId);
        const coinGain = Math.round(lesson.xpReward / 3);

        set({
          totalXp: s.totalXp + lesson.xpReward,
          coins: s.coins + coinGain,
          wordsLearned: s.wordsLearned + (firstTime ? lesson.vocab.length : 0),
          completedLessons: firstTime
            ? [...s.completedLessons, lessonId]
            : s.completedLessons,
          lessonResults: {
            ...s.lessonResults,
            [lessonId]: { completed: true, bestAccuracy: Math.max(prevBest, accuracy) },
          },
          leaderboard: s.leaderboard
            .map((p) => (p.isUser ? { ...p, xp: p.xp + lesson.xpReward } : p))
            .sort((a, b) => b.xp - a.xp),
          missionProgress: {
            ...s.missionProgress,
            m1: (s.missionProgress.m1 ?? 0) + (firstTime ? lesson.vocab.length : 0),
            m2: (s.missionProgress.m2 ?? 0) + 1,
            m3: (s.missionProgress.m3 ?? 0) + (accuracy >= 90 ? 1 : 0),
          },
        });

        get().pushNotification({
          icon: '🎉',
          title: `Lesson complete: ${lesson.title}`,
          body: `+${lesson.xpReward} XP · +${coinGain} coins · ${accuracy}% accuracy`,
        });

        const next = LESSONS.find((l) => l.order === lesson.order + 1);
        if (next && firstTime) {
          get().pushNotification({
            icon: '✨',
            title: 'New lesson unlocked',
            body: `“${next.title}” is now available.`,
          });
        }
      },

      progressMission: (id, by) =>
        set((s) => ({
          missionProgress: { ...s.missionProgress, [id]: (s.missionProgress[id] ?? 0) + by },
        })),

      claimMission: (id, reward) =>
        set((s) =>
          s.claimedMissions.includes(id)
            ? s
            : {
                claimedMissions: [...s.claimedMissions, id],
                coins: s.coins + reward,
                totalXp: s.totalXp + reward,
                leaderboard: s.leaderboard
                  .map((p) => (p.isUser ? { ...p, xp: p.xp + reward } : p))
                  .sort((a, b) => b.xp - a.xp),
              },
        ),

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: uid('n'), read: false, ts: Date.now() },
            ...s.notifications,
          ].slice(0, 30),
        })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      tickLeaderboard: () =>
        set((s) => ({
          leaderboard: s.leaderboard
            .map((p) =>
              p.isUser ? p : { ...p, xp: p.xp + Math.floor(Math.random() * 26) },
            )
            .sort((a, b) => b.xp - a.xp),
        })),

      resetDemo: () =>
        set({
          ...INITIAL,
          leaderboard: initialLeaderboard(),
          notifications: [],
          activeLessonId: null,
        }),
    }),
    {
      name: 'ksp-demo-state',
      version: 2,
      migrate: (_old, _v) => ({ leaderboard: initialLeaderboard() }),
      partialize: (s) => ({
        totalXp: s.totalXp,
        coins: s.coins,
        gems: s.gems,
        streak: s.streak,
        wordsLearned: s.wordsLearned,
        completedLessons: s.completedLessons,
        lessonResults: s.lessonResults,
        missionProgress: s.missionProgress,
        claimedMissions: s.claimedMissions,
        leaderboard: s.leaderboard,
        notifications: s.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // fix any persisted leaderboard entries missing country/university
        if (state && state.leaderboard.some((p) => !p.country)) {
          state.leaderboard = initialLeaderboard();
        }
      },
    },
  ),
);

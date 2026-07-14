'use client';

import { create } from 'zustand';

interface LessonPlayerState {
  activeLessonId: string | null;
  setActiveLesson: (id: string | null) => void;
}

/** Ephemeral UI-only state for the lesson player overlay (not server data). */
export const useLessonPlayerStore = create<LessonPlayerState>((set) => ({
  activeLessonId: null,
  setActiveLesson: (id) => set({ activeLessonId: id }),
}));

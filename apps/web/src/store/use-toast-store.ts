'use client';

import { create } from 'zustand';

import { uid } from '@/shared/lib/utils';

export interface Toast {
  id: string;
  icon?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'xp' | 'warning';
}

interface ToastState {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = uid('t');
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

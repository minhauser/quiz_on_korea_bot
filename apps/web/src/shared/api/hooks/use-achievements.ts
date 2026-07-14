'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/client';
import { useAuthStore } from '@/store/use-auth-store';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  xpReward: number;
  unlocked: boolean;
  earnedAt: string | null;
}

export function useAchievements() {
  const hasSession = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get<Achievement[]>('/achievements'),
    enabled: hasSession,
  });
}

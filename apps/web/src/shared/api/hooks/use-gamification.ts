'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/client';

export interface DailyMission {
  id: string;
  title: string;
  description: string | null;
  goal: number;
  rewardXp: number;
  rewardCoins: number;
  progress: number;
  completed: boolean;
}

export interface Reward {
  id: string;
  type: string;
  title: string;
  icon: string | null;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description: string | null;
  cost: number;
  owned: boolean;
  equipped: boolean;
}

export interface InventoryItem {
  id: string;
  rewardId: string;
  equipped: boolean;
  quantity: number;
  reward: Reward;
}

export function useDailyMissions() {
  return useQuery({
    queryKey: ['missions', 'daily'],
    queryFn: () => api.get<DailyMission[]>('/missions/daily'),
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ['gamification', 'rewards'],
    queryFn: () => api.get<Reward[]>('/gamification/rewards'),
  });
}

export function useInventory() {
  return useQuery({
    queryKey: ['gamification', 'inventory'],
    queryFn: () => api.get<InventoryItem[]>('/gamification/inventory'),
  });
}

export function usePurchaseReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) => api.post(`/gamification/rewards/${rewardId}/purchase`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useEquipReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) => api.post(`/gamification/inventory/${rewardId}/equip`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gamification'] }),
  });
}

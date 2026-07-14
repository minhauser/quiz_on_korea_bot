import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { XpRewardService } from './xp-reward.service';

type Tx = Prisma.TransactionClient;

/** Metrics emitted by gameplay use-cases; must match Mission.metric seed values. */
export type MissionMetric = 'lessons_completed' | 'words_learned' | 'quiz_high_score' | 'streak_active';

export interface CompletedMission {
  id: string;
  title: string;
  rewardXp: number;
  rewardCoins: number;
}

/**
 * Tracks daily-mission progress. Auto-assigns today's UserMission rows on
 * first touch, increments progress for whichever active missions track the
 * given metric, and awards the mission reward exactly once when completed.
 */
@Injectable()
export class MissionProgressService {
  constructor(private readonly xpReward: XpRewardService) {}

  async touch(tx: Tx, userId: string, metric: MissionMetric, amount = 1): Promise<CompletedMission[]> {
    const today = startOfDay(new Date());

    const missions = await tx.mission.findMany({
      where: { deletedAt: null, period: 'DAILY', metric },
    });
    if (missions.length === 0) return [];

    const completed: CompletedMission[] = [];

    for (const mission of missions) {
      const userMission = await tx.userMission.upsert({
        where: { userId_missionId_assignedOn: { userId, missionId: mission.id, assignedOn: today } },
        create: { userId, missionId: mission.id, assignedOn: today, progress: 0 },
        update: {},
      });

      if (userMission.completed) continue;

      const progress = Math.min(mission.goal, userMission.progress + amount);
      const justCompleted = progress >= mission.goal;

      await tx.userMission.update({
        where: { id: userMission.id },
        data: {
          progress,
          completed: justCompleted,
          completedAt: justCompleted ? new Date() : undefined,
        },
      });

      if (justCompleted) {
        if (mission.rewardXp > 0 || mission.rewardCoins > 0) {
          await this.xpReward.award(tx, userId, { xp: mission.rewardXp, coins: mission.rewardCoins });
        }
        completed.push({
          id: mission.id,
          title: mission.title,
          rewardXp: mission.rewardXp,
          rewardCoins: mission.rewardCoins,
        });
      }
    }

    return completed;
  }
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

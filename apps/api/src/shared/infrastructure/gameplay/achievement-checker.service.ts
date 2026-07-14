import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

import { RedisService } from '../redis/redis.service';
import { LEADERBOARD_ALLTIME_KEY, XpRewardService } from './xp-reward.service';

type Tx = Prisma.TransactionClient;

interface AchievementCondition {
  type: 'lessons_completed' | 'words_mastered' | 'perfect_quizzes' | 'streak' | 'world_completed' | 'leaderboard_rank';
  value: number;
  world?: string;
}

export interface UnlockedAchievement {
  id: string;
  title: string;
  icon: string | null;
  xpReward: number;
}

/**
 * Re-evaluates every achievement the user hasn't earned yet against their
 * current stats, unlocking (and awarding XP + a notification for) any whose
 * condition is now satisfied. Cheap enough to call after any gameplay action
 * since the achievement catalog is small.
 */
@Injectable()
export class AchievementCheckerService {
  constructor(
    private readonly xpReward: XpRewardService,
    private readonly redis: RedisService,
  ) {}

  async checkAndUnlock(tx: Tx, userId: string): Promise<UnlockedAchievement[]> {
    const candidates = await tx.achievement.findMany({
      where: { deletedAt: null, users: { none: { userId } } },
    });
    if (candidates.length === 0) return [];

    const [stats, profile] = await Promise.all([
      tx.statistics.findUnique({ where: { userId } }),
      tx.userProfile.findUniqueOrThrow({ where: { userId }, select: { streak: true } }),
    ]);

    const unlocked: UnlockedAchievement[] = [];

    for (const achievement of candidates) {
      const condition = achievement.condition as unknown as AchievementCondition;
      const satisfied = await this.isSatisfied(tx, userId, condition, stats, profile.streak);
      if (!satisfied) continue;

      await tx.userAchievement.create({ data: { userId, achievementId: achievement.id } });
      if (achievement.xpReward > 0) {
        await this.xpReward.award(tx, userId, { xp: achievement.xpReward });
      }
      await tx.notification.create({
        data: {
          userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: `Achievement unlocked: ${achievement.title}`,
          body: achievement.description,
        },
      });

      unlocked.push({
        id: achievement.id,
        title: achievement.title,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    }

    return unlocked;
  }

  private async isSatisfied(
    tx: Tx,
    userId: string,
    condition: AchievementCondition,
    stats: { lessonsCompleted: number; wordsMastered: number } | null,
    streak: number,
  ): Promise<boolean> {
    switch (condition.type) {
      case 'lessons_completed':
        return (stats?.lessonsCompleted ?? 0) >= condition.value;
      case 'words_mastered':
        return (stats?.wordsMastered ?? 0) >= condition.value;
      case 'streak':
        return streak >= condition.value;
      case 'perfect_quizzes': {
        const count = await tx.quizAttempt.count({ where: { userId, accuracy: 100 } });
        return count >= condition.value;
      }
      case 'world_completed':
        return this.isWorldCompleted(tx, userId, condition.world);
      case 'leaderboard_rank': {
        const rank = await this.redis.client.zrevrank(LEADERBOARD_ALLTIME_KEY, userId);
        return rank !== null && rank + 1 <= condition.value;
      }
      default:
        return false;
    }
  }

  private async isWorldCompleted(tx: Tx, userId: string, world: string | undefined): Promise<boolean> {
    if (!world) return false;

    const worldCategory = await tx.vocabularyCategory.findFirst({
      where: { name: world, parentCategoryId: null, deletedAt: null },
      select: { id: true },
    });
    if (!worldCategory) return false;

    const chapters = await tx.vocabularyCategory.findMany({
      where: { parentCategoryId: worldCategory.id, deletedAt: null },
      select: { id: true },
    });
    const categoryIds = [worldCategory.id, ...chapters.map((c) => c.id)];

    const lessons = await tx.lesson.findMany({
      where: { categoryId: { in: categoryIds }, deletedAt: null, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (lessons.length === 0) return false;

    const completedCount = await tx.lessonProgress.count({
      where: { userId, lessonId: { in: lessons.map((l) => l.id) }, completedAt: { not: null } },
    });
    return completedCount >= lessons.length;
  }
}

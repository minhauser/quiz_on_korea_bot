import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class ListAchievementsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const [achievements, earned] = await Promise.all([
      this.prisma.achievement.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);

    const earnedAt = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

    return achievements
      .filter((a) => !a.hidden || earnedAt.has(a.id))
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        unlocked: earnedAt.has(a.id),
        earnedAt: earnedAt.get(a.id) ?? null,
      }));
  }
}

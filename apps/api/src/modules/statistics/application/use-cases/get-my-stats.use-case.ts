import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

const HEATMAP_DAYS = 112; // 16 weeks

@Injectable()
export class GetMyStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const since = addDays(startOfDay(new Date()), -HEATMAP_DAYS + 1);

    const [statistics, profile, heatmap, wordProgress] = await Promise.all([
      this.prisma.statistics.findUnique({ where: { userId } }),
      this.prisma.userProfile.findUnique({ where: { userId } }),
      this.prisma.dailyActivity.findMany({
        where: { userId, date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.vocabularyProgress.findMany({
        where: { userId },
        include: {
          word: { include: { lesson: { include: { category: { include: { parent: true } } } } } },
        },
      }),
    ]);

    const masteryByWorld = new Map<string, { total: number; count: number }>();
    for (const p of wordProgress) {
      const world = p.word.lesson.category.parent?.name ?? p.word.lesson.category.name;
      const bucket = masteryByWorld.get(world) ?? { total: 0, count: 0 };
      bucket.total += p.masteryLevel;
      bucket.count += 1;
      masteryByWorld.set(world, bucket);
    }
    const categoryMastery = Array.from(masteryByWorld.entries()).map(([label, { total, count }]) => ({
      label,
      value: count > 0 ? total / count / 5 : 0,
    }));

    return {
      statistics: statistics ?? {
        studyMinutes: 0,
        wordsLearned: 0,
        wordsMastered: 0,
        lessonsCompleted: 0,
        accuracy: 0,
        totalXp: 0,
        loginDays: 0,
      },
      profile: {
        xp: profile?.xp ?? 0,
        coins: profile?.coins ?? 0,
        diamonds: profile?.diamonds ?? 0,
        streak: profile?.streak ?? 0,
        longestStreak: profile?.longestStreak ?? 0,
        currentLevel: profile?.currentLevel ?? 1,
      },
      heatmap,
      categoryMastery,
    };
  }
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}
